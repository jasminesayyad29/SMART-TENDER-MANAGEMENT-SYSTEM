import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { useTender } from '../context/TenderContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useTender();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    //role: 'bidder',
  });
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false); // For confirmation prompt
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, role } = formData;

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
        //role,
      });

      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoggedIn(true);
      alert('Login successful!');
      navigate(role === 'admin' ? '/admin/dashboard' : '/bidder/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      if (error.response) {
        setError(error.response.data.message || 'Login failed. Please try again.');
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Error occurred: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirmation(true); // Show confirmation before logging out
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setShowLogoutConfirmation(false);
    navigate('/'); 
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="logout-container">
          {showLogoutConfirmation ? (
            <div className="logout-confirmation-card">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="confirmation-buttons">
                <button onClick={confirmLogout} className="confirm-button">Yes</button>
                <button onClick={cancelLogout} className="cancel-button">No</button>
              </div>
            </div>
          ) : (
            <div className="logout-card">
              <h2>Welcome Back!</h2>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          )}
        </div>
      ) : (
        <div className="login-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Login Here</h2>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {/* <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="bidder">Bidder</option>
                <option value="admin">Tender Officer</option>
              </select>
            </div> */}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="login-button">Login</button>
            <p>
              Don't have an account? <a href="/Register">Sign up / Register</a>
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default LoginPage;
