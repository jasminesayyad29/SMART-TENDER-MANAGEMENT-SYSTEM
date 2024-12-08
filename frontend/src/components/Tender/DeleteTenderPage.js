import React, { useState } from 'react';
import './DeleteTenderPage.css'; // Import the CSS file
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom'; // Import useNavigate and useParams

const DeleteTenderPage = () => {
  const [inputTenderId, setInputTenderId] = useState(''); // State for input field
  const [reason, setReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false); // State for confirmation

  const navigate = useNavigate(); // Initialize useNavigate
  const { tenderId } = useParams(); // Get the tender ID from URL params

  const handleDelete = async (e) => {
    e.preventDefault();

    if (inputTenderId !== tenderId) {
      Swal.fire({
        title: "Tender ID does not match!",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    try {
      await axios.delete('http://localhost:5000/api/tenders', {
        data: { id: tenderId }
      });
      Swal.fire({
        title: "Tender deleted Successfully!",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => {
        navigate('/admin/tender-management'); // Navigate after successful deletion
      });
    } catch (error) {
      console.error('Error deleting tender:', error);
      Swal.fire({
        title: "Failed to delete Tender",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleConfirmation = (e) => {
    e.preventDefault();
    setConfirmDelete(true); // Show confirmation options
  };

  return (
    <div className="delete-tender-page">
      <h1>Delete Tender</h1>
      <h3>
          for Tender-id: <span style={{ fontWeight: 'bold' }}>{tenderId}</span>
        </h3>
      <form onSubmit={confirmDelete ? handleDelete : handleConfirmation}>
        <div>
          <label htmlFor="tenderId">Re-Enter Above Tender ID:</label>
          <input
            type="text"
            id="tenderId"
            value={inputTenderId}
            onChange={(e) => setInputTenderId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reason">Any Specific Reason for Deleting:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide the reason for deletion..."
          />
        </div>

        {confirmDelete ? (
          <div>
            <h3>Are you sure you want to delete this tender?</h3>
            <button className='delyes' type="submit">Yes, Delete</button>
            <a href='/admin/tender-management'><button className='delno' type="button">No, Cancel</button></a>
          </div>
        ) : (
          <button type="submit">Confirm Deletion</button>
        )}
      </form>
    </div>
  );
};

export default DeleteTenderPage;
