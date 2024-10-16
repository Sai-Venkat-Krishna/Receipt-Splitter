import { motion } from 'framer-motion';
import React from 'react';

const ReceiptDetails = ({ receipt }) => {
    return (
        <div>
            <h2>Receipt Details</h2>
            <p>Type: {receipt.type}</p>
            <p>Name: {receipt.name}</p>
            <p>Date: {receipt.date}</p>
            <p>Total: {receipt.total}</p>
            <h3>Items</h3>
            <ul>
                {receipt.items.map((item, index) => (
                    <li key={index}>{item.name} - {item.quantity} x ${item.price}</li>
                ))}
            </ul>
        </div>
    );
};

const EnhancedComponent = () => {
    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Content */}
        </motion.div>
    );
};

export default EnhancedComponent;
