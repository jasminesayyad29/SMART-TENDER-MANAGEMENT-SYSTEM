// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://smart-tender-management-system.onrender.com', // Backend URL
});

export default axiosInstance;
