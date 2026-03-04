import React from 'react';
import '../styles/Messages.css';

const MessagesPage = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">Messages</h2>
      <p className="page-subtitle">View and manage messages here.</p>
      <div className="empty-state">
        <p>No messages yet. Messages will appear here when received.</p>
      </div>
    </div>
  );
};

export default MessagesPage;
