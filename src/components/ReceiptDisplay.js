import React, { useState } from 'react';
import axios from 'axios';
import './ReceiptDisplay.css';

const ReceiptDisplay = ({ receipt, onUpdateReceipt }) => {
    const [isEditing, setIsEditing] = useState(null); // Track which item is being edited
    const [editedItems, setEditedItems] = useState(receipt.items);
    const [total, setTotal] = useState(receipt.total); // Track the total for updates

    const handleEditClick = (index) => {
        setIsEditing(index);
    };

    const handleSaveClick = async () => {
        // Save changes to the database
        const updatedReceipt = {
            ...receipt,
            items: editedItems,
            total: editedItems.reduce((sum, item) => sum + item.totalPrice, 0), // Recalculate total
        };

        try {
            const response = await axios.put(`http://localhost:5001/receipts/${receipt._id}`, updatedReceipt);
            onUpdateReceipt(response.data); // Update receipt in the parent component
        } catch (error) {
            console.error('Error saving changes:', error);
        }

        setIsEditing(null); // Exit edit mode
    };

    const handleInputChange = (index, field, value) => {
        const updatedItems = [...editedItems];
        updatedItems[index][field] = parseFloat(value);
        updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].price; // Update total price
        setEditedItems(updatedItems);
        setTotal(updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)); // Update total
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="receipt-display">
            <h3>Receipt Details</h3>
            <div className="receipt-header">
                <p><strong>{receipt.name}</strong></p>
                <p>Date: {formatDate(receipt.date)}</p>
                <p>Total: ${total.toFixed(2)}</p>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {editedItems.map((item, index) => (
                    <tr key={index}>
                        <td>{item.description}</td>
                        <td>
                            {isEditing === index ? (
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                                />
                            ) : (
                                item.quantity.toFixed(2)
                            )}
                        </td>
                        <td>
                            {isEditing === index ? (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                                />
                            ) : (
                                `$${item.price.toFixed(2)}`
                            )}
                        </td>
                        <td>${item.totalPrice.toFixed(2)}</td>
                        <td>
                            {isEditing === index ? (
                                <button onClick={handleSaveClick}>Save</button>
                            ) : (
                                <button onClick={() => handleEditClick(index)}>Edit</button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReceiptDisplay;
