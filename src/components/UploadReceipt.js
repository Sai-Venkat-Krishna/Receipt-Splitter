import React, { useState } from 'react';
import axios from 'axios';
import ReceiptDisplay from './ReceiptDisplay';
import SplitItems from './SplitItems';
import './UploadReceipt.css';

const UploadReceipt = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        setIsLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
            try {
                const response = await axios.post('/api/process-receipt', {
                    image: base64String
                });
                setReceipt(response.data);
            } catch (error) {
                console.error('Error uploading receipt:', error);
                setError('Failed to process the receipt. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(selectedFile);
    };

    return (
        <div className="upload-receipt">
            <h2>Upload New Receipt</h2>
            <div className="upload-container">
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <button onClick={handleUpload} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Upload Receipt'}
                </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {receipt && (
                <div className="receipt-content">
                    <ReceiptDisplay receipt={receipt} />
                    <SplitItems receipt={receipt} />
                </div>
            )}
        </div>
    );
};

export default UploadReceipt;
