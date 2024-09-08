const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    type: String,
    name: String,
    date: Date,
    total: Number,
    items: [
        {
            description: String,
            quantity: Number,
            price: Number,
            totalPrice: Number,
            isWeighted: Boolean
        }
    ]
});

module.exports = mongoose.model('Item', itemSchema);
