import React, { useState } from 'react';
import axios from 'axios';
import './AdminSendNotification.css';

const AdminSendNotification = () => {
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [emailPreview, setEmailPreview] = useState('');

  const generateEmailPreview = () => {
    setEmailPreview(`Recipient: ${recipientEmail}\nMessage: ${message}\nType: ${notificationType}\nPriority: ${priority}`);
  };

  const sendNotification = async () => {
    if (!message || !recipientEmail) {
      setError('Please enter a message and recipient email.');
      return;
    }
  
    try {
      setLoading(true);
      setError('');
      setEmailStatus('');
      setConfirmModalVisible(false);
  
      // Fetch user data from localStorage and parse it
      const storedUser = JSON.parse(localStorage.getItem('user'));
  
      // Check if the user data exists and has email and name
      if (!storedUser || !storedUser.name || !storedUser.email) {
        setError('Sender name or email is missing from localStorage. Please check your login session.');
        setLoading(false);
        return;
      }
  
      const { name: sendername, email: senderemail } = storedUser;
  
      await axios.post('https://smart-tender-management-system.onrender.com/api/notifications/send', {
        sendername,
        senderemail,
        message,
        recipientEmail,
        notificationType,
        priority,
      });
  
      setEmailStatus('Email sent successfully to the recipient.');
      setMessage('');
      setRecipientEmail('');
    } catch (error) {
      console.error('Error sending notification:', error.response?.data || error);
      setError('Failed to send notification. Please try again.');
      setEmailStatus('Failed to send email.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
    <br/>
    <br/>
    <div className="admin-send-notification-container">
      <h2>Send Notification</h2>
      <label htmlFor="message">Message</label>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter notification message"
        className="admin-send-notification-input-field"
      />
      <label htmlFor="email">Email</label>
      <input
        type="email"
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        placeholder="Enter recipient email"
        className="admin-send-notification-input-field"
      />

      <label htmlFor="">Notification Type</label>
      <select
        value={notificationType}
        onChange={(e) => setNotificationType(e.target.value)}
        className="admin-send-notification-select-field"
      >
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="alert">Alert</option>
      </select>

      <label htmlFor="">Priority</label>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="admin-send-notification-select-field"
      >
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>

      <button onClick={generateEmailPreview} className="admin-send-notification-preview-button">Preview Notification</button>

      {emailPreview && (
        <div className="admin-send-notification-email-preview">
          <h3>Notification Preview:</h3>
          <pre>{emailPreview}</pre>
        </div>
      )}

      <button onClick={() => setConfirmModalVisible(true)} disabled={loading} className="admin-send-notification-send-button">
        {loading ? 'Sending...' : 'Send'}
      </button>

      {error && <p className="admin-send-notification-error-message">{error}</p>}
      {emailStatus && <p className="admin-send-notification-status-message">{emailStatus}</p>}

      {confirmModalVisible && (
        <div className="admin-send-notification-modal">
          <div className="admin-send-notification-modal-content">
            <p>Are you sure you want to send this notification?</p>
            <button onClick={sendNotification} className="admin-send-notification-modal-button">Yes, Send</button>
            <button onClick={() => setConfirmModalVisible(false)} className="admin-send-notification-modal-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
    <br/>
    <br/>
    <br/>
    </>
  );
};

export default AdminSendNotification;
