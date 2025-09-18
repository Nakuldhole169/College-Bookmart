import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/transactions.css'

function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/transaction/`, {
                    headers: {
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminToken'))}`
                    },
                });
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, []);

    return (
  <div className="transaction-history">
    <h2 className="transaction-header">💳 Transaction History</h2>
    <ul className="transactions">
      {transactions.map((transaction) => (
        <li key={transaction._id} className="transaction-card">
          <p>
            <strong>Transaction ID:</strong> {transaction.transactionId}
            <span className="divider">|</span>
            <strong>Order ID:</strong> {transaction.orderId}
            <span className="divider">|</span>
            <strong>Date:</strong> {new Date(transaction.date).toLocaleString()}
            <span className="divider">|</span>
            <strong>Amount:</strong> Rs. {transaction.bill_amt}
            <span className="divider">|</span>
            <strong>Type:</strong> {transaction.transactionFor}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

}

export default TransactionHistory;
