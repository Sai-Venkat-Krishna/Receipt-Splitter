import { motion } from 'framer-motion';
import React from 'react';
import UploadReceipt from './components/UploadReceipt';
import ReceiptList from './components/ReceiptList';
import './App.css';

const App = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {<div className="app">
                <header className="app-header">
                    <h1>Receipt Splitter</h1>
                </header>
                <main className="container">
                    <UploadReceipt />
                    <ReceiptList />
                </main>
            </div>}
        </motion.div>
    );
};

export default App;