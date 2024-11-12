// BidderNotifications.js
import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './BidderNotifications.css';

const BidderNotifications = () => {
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [newNotificationAlert, setNewNotificationAlert] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // New state for unread count

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
          setError('No user information found');
          setLoading(false);
          return;
        }

        const recipientEmail = user.email;
        const response = await Axios.get('http://localhost:5000/api/notifications/notifications', {
          params: { recipientEmail },
        });

        // Separate unread and read notifications
        const unread = response.data.notifications.filter(n => !n.isRead);
        const read = response.data.notifications.filter(n => n.isRead);

        setUnreadNotifications(unread);
        setReadNotifications(read);
        setUnreadCount(unread.length); // Set unread count
        setNewNotificationAlert(unread.length > 0); // Show alert if new notifications are present
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch notifications');
        setLoading(false);
        console.error(err);
      }
    };

    fetchNotifications();

    // Polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Mark notifications as read
  const markNotificationsAsRead = async () => {
    const unreadNotificationIds = unreadNotifications.map(n => n._id);
    if (unreadNotificationIds.length === 0) return;

    try {
      await Axios.put('http://localhost:5000/api/notifications/notifications/mark-read', {
        notificationIds: unreadNotificationIds,
      });
      setReadNotifications([...readNotifications, ...unreadNotifications]);
      setUnreadNotifications([]);
      setUnreadCount(0); // Reset unread count to 0
      setNewNotificationAlert(false);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  if (loading) {
    return <div className="bidder-notifications-loading-state">Loading notifications...</div>;
  }

  return (
    <div className="bidder-notifications-container">
      <h1>Notifications</h1>
      {newNotificationAlert && (
        <div className="new-notification-alert" onClick={markNotificationsAsRead}>
          You have new notifications! Click here to mark them as read.
        </div>
      )}

      <div className="unread-notification-count">
        <p><strong>{unreadCount}</strong> Unread Notifications</p>
      </div>

      {error && <p className="bidder-notifications-error-message">{error}</p>}
      
      <section>
        <h2>New Notifications</h2>
        <ul className="bidder-notifications-list">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <li
                key={notification._id}
                className={`bidder-notifications-item unread`}
              >
                <p><strong>Message:</strong> {notification.message}</p>
                <p><strong>Type:</strong> 
                  <span className={`bidder-notifications-type ${notification.notificationType}`}>
                    {notification.notificationType}
                  </span>
                </p>
                <p><strong>Priority:</strong> {notification.priority}</p>
                <p><strong>Received At:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
              </li>
            ))
          ) : (
            <p className="bidder-notifications-no-notifications">No new notifications available.</p>
          )}
        </ul>
      </section>

      <section>
        <h2>Read Notifications</h2>
        <ul className="bidder-notifications-list">
          {readNotifications.length > 0 ? (
            readNotifications.map((notification) => (
              <li
                key={notification._id}
                className="bidder-notifications-item"
              >
                <p><strong>Message:</strong> {notification.message}</p>
                <p><strong>Type:</strong> 
                  <span className={`bidder-notifications-type ${notification.notificationType}`}>
                    {notification.notificationType}
                  </span>
                </p>
                <p><strong>Priority:</strong> {notification.priority}</p>
                <p><strong>Received At:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
              </li>
            ))
          ) : (
            <p className="bidder-notifications-no-notifications">No read notifications available.</p>
          )}
        </ul>
      </section>
    </div>
  );
};

export default BidderNotifications;
