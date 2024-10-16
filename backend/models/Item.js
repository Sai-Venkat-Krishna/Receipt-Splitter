// File: models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    total: { type: Number, required: true },
    items: [
        {
            description: String,
            quantity: Number,
            price: Number,
            totalPrice: Number,
            isWeighted: Boolean,
        }
    ],
    tax: Number,
    discount: Number,
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);