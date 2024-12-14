import React, { useState } from 'react';
import './RegistrationPage.css';  // Assuming you have CSS for styling
import { Link, useNavigate } from 'react-router-dom';  // Import Link and useNavigate from react-router-dom
import axios from 'axios'; // Import axios for API requests
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';  // Import the icons you need

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');  // To store error messages
  const navigate = useNavigate();  // Hook for navigation

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePasswords = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role, agreeTerms } = formData;

    // Password validation checks
    const passwordValidationErrors = [];
    
    if (password.length < 8) {
      passwordValidationErrors.push('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      passwordValidationErrors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      passwordValidationErrors.push('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      passwordValidationErrors.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      passwordValidationErrors.push('Password must contain at least one special character.');
    }
    
    if (passwordValidationErrors.length > 0) {
      setError(passwordValidationErrors.join(' ')); // Set error message if there are validation errors
      return; // Stop further processing
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');  // Set error message
    } else {
      try {
        // Example API request
        await axios.post("https://smart-tender-management-system.onrender.com/api/signup", {
          name, email, password, role,
        });

        Swal.fire({
          title: "Registration Successful!",
          text: "User registered successfully.",
          icon: "success",
          confirmButtonText: "OK"
        });

        navigate('/login');
      } catch (error) {
        console.error('Registration failed', error);

        if (error.response && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    }
  };

  return (
    <div className="registrationPage-container">
      <form onSubmit={validatePasswords} className="registrationPage-form">
        <br />
        <h3>Create Your Account</h3>
        <br />

        {/* Name Field */}
        <div className="registrationPage-input-group">
          <label>Name :</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
          <FontAwesomeIcon icon={faUser} className="input-icon" />
        </div>

        {/* Email Field */}
        <div className="registrationPage-input-group">
          <label>Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
          <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
        </div>

        {/* Role Dropdown */}
        <div className="registrationPage-input-group">
          <label>Role :</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Bidder">Bidder</option>
            <option value="Tender Officer">Tender Officer</option>
          </select>
        </div>

        {/* Password Field */}
        <div className="registrationPage-input-group">
          <label>Enter Password :</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={togglePasswordVisibility}
            className="input-icon"
          />
        </div>

        {/* Confirm Password Field */}
        <div className="registrationPage-input-group">
          <label>Confirm Password :</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEyeSlash : faEye}
            onClick={toggleConfirmPasswordVisibility}
            className="input-icon"
          />
        </div>

        {/* Agree to Terms Checkbox */}
        <div className="registrationPage-input-group">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            className='registrationPage-checkbox'
            checked={formData.agreeTerms}
            onChange={handleChange}
            required
          />
          <label htmlFor="agreeTerms">
            <pre>                        I agree to the <Link to="/terms-of-service">Terms of service</Link></pre>
            <br/>
          </label>  
        </div>

        {/* Register Button */}
        <button type="submit" className="registrationPage-register-button">Register</button>

        {/* Error Message */}
        {error && <p className="registrationPage-error-message">{error}</p>}

        {/* Already a member */}
        <h4><p>Already a member?
          <Link to="/login">   Sign-in</Link>
        </p></h4>
      </form>

      <div className="registrationPage-illustration-container">
        <img className='register' src="/logowhite.png" alt="Sign up illustration" />
        <img className="register1" src="/register1.png" alt="Sign up illustration" />
      </div>
    </div>
  );
};

export default RegistrationPage;
