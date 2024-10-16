// File: index.js
require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const receiptRoutes = require('./routes/receipts');

const app = express();
const port = process.env.PORT || 5001;

// Environment variable validation
if (!process.env.AZURE_ENDPOINT || !process.env.AZURE_API_KEY || !process.env.MONGODB_URI) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

mongoose.connection.on('disconnected', () => {
    console.warn('Lost MongoDB connection...');
});
mongoose.connection.on('reconnected', () => {
    console.info('Reconnected to MongoDB');
});

// Routes
app.use('/receipts', receiptRoutes);

// Centralized error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});