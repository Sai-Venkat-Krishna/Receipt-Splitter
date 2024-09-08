import React from 'react';
import UploadReceipt from './components/UploadReceipt';
import ReceiptList from './components/ReceiptList';
import './App.css';

const App = () => (
    <div className="app">
        <header className="app-header">
            <h1>Receipt Splitter</h1>
        </header>
        <main className="container">
            <UploadReceipt />
            <ReceiptList />
        </main>
    </div>
);

export default App;