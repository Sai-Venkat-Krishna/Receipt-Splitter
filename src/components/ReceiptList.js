import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReceiptDisplay from './ReceiptDisplay';
import SplitItems from './SplitItems';
import Loading from './Loading';
import ConfirmModal from './ConfirmModal';
import './ReceiptList.css';

const ReceiptList = () => {
    const [receipts, setReceipts] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [receiptToDelete, setReceiptToDelete] = useState(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/receipts');
            setReceipts(response.data);
        } catch (error) {
            console.error('Error fetching receipts:', error);
            setError('Failed to fetch receipts. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/receipts/${receiptToDelete._id}`);
            setReceipts(receipts.filter(r => r._id !== receiptToDelete._id));
            if (selectedReceipt && selectedReceipt._id === receiptToDelete._id) {
                setSelectedReceipt(null);
            }
        } catch (error) {
            console.error('Error deleting receipt:', error);
            setError('Failed to delete receipt');
        } finally {
            setIsDeleteModalOpen(false);
            setReceiptToDelete(null);
        }
    };

    return (
        <div className="receipt-list">
            <h2>Recent Receipts</h2>
            {isLoading && <Loading />}
            {error && <p className="error-message">{error}</p>}
            <ul>
                {receipts.map((receipt) => (
                    <li key={receipt._id}>
                        <span onClick={() => setSelectedReceipt(receipt)}>
                            {receipt.name} - {new Date(receipt.date).toLocaleDateString()}
                        </span>
                        <button className="delete-button" onClick={() => setIsDeleteModalOpen(true)}>Delete</button>
                    </li>
                ))}
            </ul>

            {selectedReceipt && (
                <div className="selected-receipt">
                    <ReceiptDisplay key={selectedReceipt._id} receipt={selectedReceipt} />
                    <SplitItems key={selectedReceipt._id} receipt={selectedReceipt} />
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                message="Are you sure you want to delete this receipt?"
            />
        </div>
    );
};

export default ReceiptList;
