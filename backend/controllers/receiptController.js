// File: controllers/receiptController.js
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const Item = require('../models/Item');
const winston = require('winston');

// Azure Form Recognizer setup
const client = new DocumentAnalysisClient(
    process.env.AZURE_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_API_KEY)
);

// Winston logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'receipt-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
// Helper function to process receipt items
function processReceiptItems(receiptItems, taxAmount, discountAmount) {
    let items = receiptItems.map((item, index) => {
        let quantity = item.properties.Quantity ? item.properties.Quantity.value : 1;
        let price = item.properties.Price ? item.properties.Price.value : 0;
        let totalPrice = item.properties.TotalPrice ? item.properties.TotalPrice.value : 0;
        let description = item.properties.Description ? item.properties.Description.value.trim() : '';

        if (!description) {
            description = `Item ${index + 1}${totalPrice ? ` ($${totalPrice.toFixed(2)})` : ''}`;
        }

        const weightMatch = description.match(/(\d+(?:\.\d+)?)\s*(lb|oz|g)/i);
        let isWeighted = !!weightMatch;
        if (isWeighted) {
            quantity = parseFloat(weightMatch[1]);
            if (price === 0 && totalPrice !== 0) {
                price = totalPrice / quantity;
            }
        }

        const perUnitMatch = description.match(/(\d+(?:\.\d+)?)\s*@\s*(\d+(?:\.\d+)?)/);
        if (perUnitMatch) {
            quantity = parseFloat(perUnitMatch[1]);
            price = parseFloat(perUnitMatch[2]);
        }

        if (description.toUpperCase() === 'TAX') {
            quantity = 1;
            price = totalPrice = taxAmount;
        }
        if (description.toUpperCase() === 'DISCOUNT') {
            quantity = 1;
            totalPrice = -Math.abs(discountAmount);
        }

        if (totalPrice !== 0 && (quantity === 0 || price === 0)) {
            if (quantity === 0 && price !== 0) {
                quantity = totalPrice / price;
            } else if (price === 0 && quantity !== 0) {
                price = totalPrice / quantity;
            } else {
                quantity = 1;
                price = totalPrice;
            }
        }

        if (Math.abs(totalPrice - (quantity * price)) > 0.01) {
            totalPrice = quantity * price;
        }

        quantity = Math.round(quantity * 100) / 100;
        price = Math.round(price * 100) / 100;
        totalPrice = Math.round(totalPrice * 100) / 100;

        return {
            description,
            quantity,
            price,
            totalPrice,
            isWeighted
        };
    });

    return items.filter(item => item.totalPrice !== 0 || item.description.toUpperCase() === 'TAX');
}

// Controller functions
    exports.processReceipt = async (req, res) => {
        console.log('Received request to process receipt');

        if (!req.body.image) {
            return res.status(400).send({ error: 'No image data received' });
        }

        const base64Image = req.body.image;
        const buffer = Buffer.from(base64Image, 'base64');

        const timeout = 60000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const poller = await client.beginAnalyzeDocument("prebuilt-receipt", buffer, { abortSignal: controller.signal });
            const { documents: [receipt] } = await poller.pollUntilDone();

            if (!receipt) {
                throw new Error('No receipt data found.');
            }

            const merchantName = receipt.fields.MerchantName ? receipt.fields.MerchantName.value : 'Unknown Merchant';
            const transactionDate = receipt.fields.TransactionDate ? receipt.fields.TransactionDate.value : new Date();
            let total = receipt.fields.Total ? receipt.fields.Total.value : 0;
            let taxAmount = receipt.fields.Tax ? receipt.fields.Tax.value : 0;
            let discountAmount = receipt.fields.Discount ? receipt.fields.Discount.value : 0;

            let items = processReceiptItems(receipt.fields.Items ? receipt.fields.Items.values : [], taxAmount, discountAmount);

            const calculatedTotal = items.reduce((sum, item) => sum + item.totalPrice, 0) + taxAmount - Math.abs(discountAmount);
            total = Math.round(calculatedTotal * 100) / 100;

            const newItem = new Item({
                type: 'receipt',
                name: merchantName,
                date: transactionDate,
                total: total,
                items: items,
                tax: taxAmount,
                discount: discountAmount
            });

            await newItem.save();

            res.status(200).send(newItem);
        } catch (error) {
            console.error('Error processing receipt:', error);
            if (error.name === 'AbortError') {
                res.status(500).send({ error: 'Receipt processing timed out. Please try again.' });
            } else {
                res.status(500).send({ error: `Failed to process the receipt-------: ${error.message}` });
            }
        } finally {
            clearTimeout(timeoutId);
        }
    };

exports.getReceipts = async (req, res, next) => {
    try {
        const receipts = await Item.find().sort({ date: -1 }).limit(20);
        res.status(200).send(receipts);
    } catch (error) {
        logger.error('Error fetching receipts:', error);
        next(error);
    }
};

exports.deleteReceipt = async (req, res, next) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'Receipt deleted successfully' });
    } catch (error) {
        logger.error('Error deleting receipt:', error);
        next(error);
    }
};

exports.updateReceipt = async (req, res, next) => {
    try {
        const updatedReceipt = await Item.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    items: req.body.items,
                    total: req.body.total,
                    tax: req.body.tax,
                    discount: req.body.discount,
                }
            },
            { new: true }
        );

        if (!updatedReceipt) {
            return res.status(404).send({ error: 'Receipt not found' });
        }

        res.status(200).send(updatedReceipt);
    } catch (error) {
        logger.error('Error updating receipt:', error);
        next(error);
    }
};