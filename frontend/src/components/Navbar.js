// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const [userRole, setUserRole] = useState('');
  const [unreadCount, setUnreadCount] = useState(0); // New state for unread count

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role);
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        const parsedUpdatedUser = JSON.parse(updatedUser);
        setUserRole(parsedUpdatedUser.role);
      } else {
        setUserRole('');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch unread notifications count for Bidder role
  useEffect(() => {
    const fetchUnreadNotificationsCount = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
          setUnreadCount(0);
          return;
        }

        const recipientEmail = user.email;
        const response = await Axios.get('https://smart-tender-management-system.onrender.com/api/notifications/notifications', {
          params: { recipientEmail },
        });

        const unread = response.data.notifications.filter(n => !n.isRead);
        setUnreadCount(unread.length);
      } catch (err) {
        //console.error('Error fetching unread notifications:', err);
        setUnreadCount(0); // Fallback to 0 if there's an error
      }
    };

    if (userRole === 'Bidder') {
      fetchUnreadNotificationsCount();
    }

    // Polling for unread notifications every 1.5 seconds
    const interval = setInterval(fetchUnreadNotificationsCount, 1500);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [userRole]);

  return (
    <nav className="navbar">
      <div className="tender">
        <a href="/">
          <img src="/logowhite.png" alt="TENDERbus Logo" className="logotender" />
        </a>
      </div>

      <ul className="nav-links">
        {!userRole && (
          <li className="custom-dropdown">
            <button className="custom-dropbtn"><Link to="/login">Login</Link></button>
          </li>
        )}
        <a href="/" className="link">Home</a>
        <li className="navbut"><Link to="/tender/tenders">Open Tenders</Link></li>

        {userRole === 'Bidder' && (
          <>
            <button className="dropbtn"><Link to="/profile">Profile</Link></button>
            <li className="navbut"><Link to="/bidder/dashboard">Dashboard</Link></li>
            <li className="navbut">
            <div className='no-icon'>
  <Link to="/Bidder/notifications">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C10.07 2 8.4 3.24 7.68 5.03C5.88 5.52 4.5 7.13 4.5 9v5l-1.29 1.29A.996.996 0 0 0 3 17h18a.996.996 0 0 0 .71-1.71L20.5 14V9c0-1.87-1.38-3.48-3.18-3.97C15.6 3.24 13.93 2 12 2zm0 18c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z"/>
    </svg>
    {unreadCount > 0 && (
      <span className="notification-badge-wrapper">
        <span className="notification-badge">{unreadCount}</span>
      </span>
    )}
  </Link>
</div>

            </li>

          </>
        )}

        {userRole === 'Tender Officer' && (
          <>
            <button className="dropbtn"><Link to="/profile">Profile</Link></button>
            <li className="navbut"><Link to="/admin/dashboard">Dashboard</Link></li>
          </>
        )}

        <li className="navbut"><Link to="/help">Help</Link></li>
        <a href="/about" className="link">About us</a>
      </ul>
    </nav>
  );
};

export default Navbar;
