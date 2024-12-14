import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AllTenderDetails.css';

const AllTenderDetails = () => {
  const { tenderId } = useParams(); // Get tenderId from the URL
  const navigate = useNavigate(); // Use navigate to go back to the previous page
  const [quotationData, setQuotationData] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(true); // Start with the modal open

  // Fetch tender quotation details based on Tender ID
  const fetchTenderQuotation = async () => {
    if (!tenderId) {
      setError('Please enter a valid Tender ID.');
      return;
    }

    try {
      const response = await axios.get(`https://smart-tender-management-system.onrender.com/api/tenders/id/${tenderId}`);
      setQuotationData(response.data); // Store the fetched data
      setError('');
    } catch (error) {
      console.error('Error fetching tender details:', error);
      setError('Failed to fetch the quotation details. Please check the Tender ID.');
    }
  };

  // Call fetchTenderQuotation when component mounts
  useEffect(() => {
    const fetchTenderQuotation = async () => {
      if (!tenderId) {
        setError('Please enter a valid Tender ID.');
        return;
      }
  
      try {
        const response = await axios.get(`https://smart-tender-management-system.onrender.com/api/tenders/id/${tenderId}`);
        const data = response.data;
  
        // Check if endDate belongs within today's date and set status dynamically
        const today = new Date();
        const endDate = data?.endDate ? new Date(data.endDate) : null;
        if (endDate && endDate >= today) {
          data.status = "Active";
        } else {
          data.status = "Inactive";
        }
  
        setQuotationData(data); // Store the fetched data
        setError('');
      } catch (error) {
        console.error('Error fetching tender details:', error);
        setError('Failed to fetch the quotation details. Please check the Tender ID.');
      }
    };
  
    fetchTenderQuotation();
  }, [tenderId]); // Trigger on mount and if tenderId changes
  
  // Close modal and navigate back to the previous page
  const closeModal = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="quotation-page" style={{ textAlign: "left" }}>
    
      {error && <div className="error" style={{ textAlign: "left" }}>{error}</div>}

      {/* Modal to display all data */}
      {showModal && (
        <div className="modal" style={{ textAlign: "left" }}>
          <div
            className="modal-content"
            style={{ textAlign: "left" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              style={{ textAlign: "left" }}
              onClick={closeModal}
            >
              ×
            </button>
            {/* Tender Details */}
            <h2 style={{ textAlign: "left" }}>Tender Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <label><strong>Tender ID:</strong></label>
                <span>{quotationData?._id}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <label><strong>Title:</strong></label>
                <span>{quotationData?.title}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <label><strong>Created by:</strong></label>
                <span>{quotationData?.email}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <label><strong>Description:</strong></label>
                <span>{quotationData?.description}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <label><strong>Type:</strong></label>
                <span>{quotationData?.type}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
  <label><strong>Status:</strong></label>
  <span
    style={{
      fontWeight: "bold",
      color: quotationData?.status === "Inactive" ? "red" : quotationData?.status === "Active" ? "rgb(15, 176, 3)" : "black",
    }}
  >
    {quotationData?.status}
  </span>
</div>

              <div style={{ display: "flex", gap: "10px" }}>
                <label><strong>Start Date:</strong></label>
                <span>
                  {quotationData?.startDate
                    ? new Date(quotationData.startDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <label><strong>End Date:</strong></label>
                <span>
                  {quotationData?.endDate
                    ? new Date(quotationData.endDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              {quotationData?.document && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Document:</strong></label>
                  <a
                    href={`https://smart-tender-management-system.onrender.com/${quotationData.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>

            {/* Quotation Details */}
      
            <p style={{ textAlign: "center", fontWeight: "bold", fontSize : "larger"}}>Quotation Details</p>
            <table style={{ textAlign: "left", width: "100%" }}>
              <thead>
                <tr>
                  <th>Materials</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotationData?.materials &&
                  quotationData.materials.map((material, index) => (
                    <tr key={index}>
                      <td>{material}</td>
                      <td>{quotationData.quantity[index]}</td>
                      <td>{quotationData.TenderPropAmount[index]}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="total-quotation" style={{ textAlign: "left" }}>
              <strong>Total Quotation Amount: </strong>
              {quotationData?.Totalquotation}
            </div>
         
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTenderDetails;
