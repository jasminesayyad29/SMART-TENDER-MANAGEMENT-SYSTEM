import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BidDetailsPage.css';
import { fetchbidsbymail } from '../../services/bidService';

const BidDetailsPage = () => {
  const { tenderId, bidderID } = useParams();
  const navigate = useNavigate();
  const [bidDetails, setBidDetails] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [quotationData, setQuotationData] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Retrieve email from user object in localStorage and log it
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const email = storedUser?.email;
    console.log("Email from localStorage:", email);
  
    if (!email) {
      setError("User email not found in localStorage.");
      return;
    }
  
    // Fetch bids based on email
    const getBids = async () => {
      try {
        const data = await fetchbidsbymail(email);
  
        // Add status logic based on expiryDate
        const today = new Date();
        data.forEach((bid) => {
          const expiryDate = bid.expiryDate ? new Date(bid.expiryDate) : null;
          bid.status = expiryDate && expiryDate >= today ? 'Active' : 'Inactive';
        });
  
        // Sort bids by createdAt (newest first)
        const sortedBids = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
        setBidDetails(sortedBids);
      } catch (err) {
        setError(`No Bids found for email: ${email}`);
        console.error("Error fetching bids:", err);
      }
    };
  
    getBids();
  }, []);
  

  const openModal = (bid) => {
    setSelectedBid(bid);
    setShowModal(true);

    // Fetch quotation data
    const fetchQuotationDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tenders/id/${bid.tenderId}`);
        const data = response.data;

        // Fetch BidderPropAmount and include it in the quotationData
        const bidderAmounts = bid.BidderPropAmount || [];

        setQuotationData({
          ...data,
          BidderPropAmount: bidderAmounts,
        });
      } catch (err) {
        console.error("Error fetching quotation details:", err);
        setError('Failed to fetch quotation details.');
      }
    };

    fetchQuotationDetails();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBid(null);
  };

  if (error) return <p className="bid-details-page-error-message">{error}</p>;
  if (!bidDetails) return <p>Loading bid details...</p>;

  return (
    <>
      {/* Title Container */}
      <div className="bid-details-page-title-container">
        <button className="bid-details-page-back-button" onClick={() => navigate(-1)}> ← Back</button>
        <h2 className="bid-details-page-bidtitle">Your Bids</h2>
      </div>

      <div className="bid-details-page-bid-details-container">
        {bidDetails.map((bid) => (
          <div key={bid._id} className="bid-details-page-card" onClick={() => openModal(bid)}>
            <h2>Bid Details for Tender-Id: <span>{bid.tenderId}</span></h2>
            <h3>Bid ID: <span>{bid._id}</span></h3>
            <h3>Tender: <span>{bid.tenderId}</span></h3>
          </div>
        ))}

        {showModal && selectedBid && (
          <div className="modal" style={{ textAlign: 'left' }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
              <button className="modal-close-button" onClick={closeModal}>×</button>

              {/* Bid Details */}
              <h2>Bid Details</h2>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Bid ID:</strong></label>
                    <span>{selectedBid._id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Bidder Name:</strong></label>
                    <span>{selectedBid.bidderName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Company Name:</strong></label>
                    <span>{selectedBid.companyName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Email:</strong></label>
                    <span>{selectedBid.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Phone Number:</strong></label>
                    <span>{selectedBid.phoneNumber}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Tender ID:</strong></label>
                    <span>{selectedBid.tenderId}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Description:</strong></label>
                    <span>{selectedBid.description}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Additional Notes:</strong></label>
                    <span>{selectedBid.additionalNotes}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Expiry Date:</strong></label>
                    <span>{selectedBid.expiryDate ? new Date(selectedBid.expiryDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {selectedBid.filePath && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Document:</strong></label>
                      <a href={`http://localhost:5000/${selectedBid.filePath}`} target="_blank" rel="noopener noreferrer">View Document</a>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label><strong>Status:</strong></label>
                    <span style={{ fontWeight: 'bold', color: selectedBid.status === 'Inactive' ? 'red' : 'green' }}>
                      {selectedBid.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quotation Details */}
              {quotationData && (
                <div>
                  <h2>Quotation Details</h2>
                  <table style={{ textAlign: 'left', width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Materials</th>
                        <th>Quantity</th>
                        <th>Proposed Amount</th>
                        <th>Bid Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotationData.materials && quotationData.materials.map((material, index) => (
                        <tr key={index}>
                          <td>{material}</td>
                          <td>{quotationData.quantity[index]}</td>
                          <td>{quotationData.TenderPropAmount[index]}</td>
                          <td>
                            {quotationData.BidderPropAmount && quotationData.BidderPropAmount[index] !== undefined
                              ? quotationData.BidderPropAmount[index]
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className='subAmou'>
                    <div className="total-quotation">
                      <strong>Total Quotation Amount: </strong>{quotationData?.Totalquotation}
                    </div>
                    <div className="total-bid-amount">
                      <strong>Total Bid Amount: </strong>{selectedBid.bidAmount}
                    </div>
                  </div>
                </div>
              )}
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

export default BidDetailsPage;
