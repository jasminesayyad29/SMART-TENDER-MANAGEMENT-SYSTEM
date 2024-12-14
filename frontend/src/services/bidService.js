// services/bidService.js
import axios from 'axios';

const API_URL = 'https://smart-tender-management-system.onrender.com/api/bids/email'; 

export const fetchbidsbymail = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/${email}`); // Corrected API URL
    return response.data; // Return the list of tenders
  } catch (error) {
    console.error('Error fetching Bids:', error);
    throw error;
  }
};