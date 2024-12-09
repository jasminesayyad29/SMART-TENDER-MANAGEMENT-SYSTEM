import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AllBidDetails.css';

const AllBidDetails = () => {
  const { bidId } = useParams(); // Get bidId from the URL
  const navigate = useNavigate(); // Use navigate to go back to the previous page
  const [bidData, setBidData] = useState([]);
  const [quotationData, setQuotationData] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(true); // Start with the modal open

// Fetch bid details by bidId
const fetchBidDetails = async () => {
  try {
    if (bidId) {
      // Fetch bid details using bidId
      const response = await axios.get(`http://localhost:5000/api/bids/id/${bidId}`);
      const bid = response.data;
      if (!bid) {
        setError('Bid not found for the provided Bid ID.');
        return;
      }

      // Calculate status based on expiryDate
      const today = new Date();
      const endDate = bid.expiryDate ? new Date(bid.expiryDate) : null;
      const bidStatus = endDate && endDate >= today ? 'Active' : 'Inactive';

      // Set status in bidData
      setBidData([{ ...bid, status: bidStatus }]); // Store the bid with status

      // Fetch quotation details using tenderId and BidderPropAmount as an array
      const bidderPropAmountArray = Array.isArray(bid.BidderPropAmount) ? bid.BidderPropAmount : [bid.BidderPropAmount];
      await fetchQuotationDetails(bid.tenderId, bidderPropAmountArray);
    } else {
      setError('Please provide a Bid ID.');
      return;
    }
  } catch (error) {
    console.error('Error fetching bid details:', error);
    setError('Failed to fetch bid details. Please check the provided Bid ID.');
  }
};


  // Fetch quotation details from tender schema
 // Fetch quotation details from tender schema
const fetchQuotationDetails = async (targetTenderId, bidderAmounts, bidExpiryDate) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/tenders/id/${targetTenderId}`);
    const data = response.data;

    // Add status logic based on bidExpiryDate and today's date
    const today = new Date();
    const endDate = bidExpiryDate ? new Date(bidExpiryDate) : null;
    const status = endDate && endDate >= today ? 'Active' : 'Inactive';
    data.status = status;

    // Include BidderPropAmount in quotationData
    setQuotationData({
      ...data,
      BidderPropAmount: bidderAmounts,
    });

  } catch (error) {
    console.error('Error fetching quotation details:', error);
    setError('Failed to fetch quotation details.');
  }
};

  

  // Call fetchBidDetails when component mounts
  useEffect(() => {
    fetchBidDetails();
  }, [bidId]); // Trigger on mount and if bidId changes

  // Close modal and navigate back to the previous page
  const closeModal = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="bid-details-page" style={{ textAlign: 'left' }}>
      {error && <div className="error" style={{ textAlign: 'left' }}>{error}</div>}

      {/* Modal to display all data */}
      {showModal && (
        <div className="modal" style={{ textAlign: 'left' }}>
          <div
            className="modal-content"
            style={{ textAlign: 'left' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              style={{ textAlign: 'left' }}
              onClick={closeModal}
            >
              ×
            </button>
            {/* Bid Details */}
            <h2 style={{ textAlign: 'left' }}>Bid Details</h2>
            {bidData && bidData.length > 0 ? (
              bidData.map((bid, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Bid ID:</strong></label>
                      <span>{bid._id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Bidder Name:</strong></label>
                      <span>{bid.bidderName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Company Name:</strong></label>
                      <span>{bid.companyName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Company Registration Number:</strong></label>
                      <span>{bid.companyRegNumber}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Email:</strong></label>
                      <span>{bid.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Phone Number:</strong></label>
                      <span>{bid.phoneNumber}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Tender ID:</strong></label>
                      <span>{bid.tenderId}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Description:</strong></label>
                      <span>{bid.description}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Additional Notes:</strong></label>
                      <span>{bid.additionalNotes}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label><strong>Expiry Date:</strong></label>
                      <span>
                        {bid.expiryDate
                          ? new Date(bid.expiryDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    {bid.filePath && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label><strong>Document:</strong></label>
                        <a
                          href={`http://localhost:5000/${bid.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                   <div style={{ display: 'flex', gap: '10px' }}>
  <label><strong>Status:</strong></label>
  <span
    style={{
      fontWeight: 'bold',
      color: bid.status === 'Inactive' ? 'red' : 'green',
    }}
  >
    {bid.status}
  </span>
</div>

                  </div>
                </div>
              ))
            ) : (
              <div>No bids found for the given Bid ID.</div>
            )}

            {/* Quotation Details */}
            {quotationData && (
              <div>
                <h2 style={{ textAlign: 'left' }}>Quotation Details</h2>
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
  {quotationData.materials &&
    quotationData.materials.map((material, index) => (
      <tr key={index}>
        <td>{material}</td>
        <td>{quotationData.quantity[index]}</td>
        <td>{quotationData.TenderPropAmount[index]}</td>
        <td>{quotationData.BidderPropAmount[index] || 'N/A'}</td>
      </tr>
    ))}
</tbody>




                </table>
                <div className="subAmou">
                  <div className="total-quotation" style={{ textAlign: 'left' }}>
                    <strong>Total Quotation Amount: </strong>
                    {quotationData?.Totalquotation}
                  </div>
                  <div className="total-bid-amount" style={{ textAlign: 'left' }}>
                    <strong>Total Bid Amount: </strong>
                    {bidData.length > 0 ? bidData[0].bidAmount : 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBidDetails;
