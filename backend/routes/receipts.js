// File: routes/receipts.js
const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

// Define routes
router.post('/process-receipt', receiptController.processReceipt);
router.get('/', receiptController.getReceipts);
router.delete('/:id', receiptController.deleteReceipt);
router.put('/:id', receiptController.updateReceipt);

module.exports = router;