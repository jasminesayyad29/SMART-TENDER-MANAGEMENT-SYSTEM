import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AllBidDetails.css';

const AllBidDetails = () => {
  const { tenderId, email } = useParams(); // Get tenderId or email from the URL
  const navigate = useNavigate(); // Use navigate to go back to the previous page
  const [bidData, setBidData] = useState([]);
  const [quotationData, setQuotationData] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(true); // Start with the modal open

 // Fetch bid details by tender ID or email
// Fetch bid details by tender ID or email
const fetchBidDetails = async () => {
    try {
      let response;
      if (tenderId) {
        response = await axios.get(`http://localhost:5000/api/bids/tender/${tenderId}`);
      } else if (email) {
        response = await axios.get(`http://localhost:5000/api/bids/email/${email}`);
      } else {
        setError('Please provide either a Tender ID or Email.');
        return;
      }
  
      const data = response.data;
  
      // Add status logic based on expiryDate
      const today = new Date();
      data.forEach((bid) => {
        const expiryDate = bid.expiryDate ? new Date(bid.expiryDate) : null;
        bid.status = expiryDate && expiryDate >= today ? 'Active' : 'Inactive';
      });
  
      setBidData(data); // Store the fetched bid data
  
      // Extract BidderPropAmount and include in quotationData
      let bidderAmounts = [];
      if (data.length > 0) {
        bidderAmounts = tenderId
          ? data.filter(bid => bid.tenderId === tenderId).map(bid => bid.BidderPropAmount).flat()
          : [];
      }
  
      // Fetch quotation details if tenderId is not directly provided
      const targetTenderId = tenderId || (data.length > 0 ? data[0].tenderId : null);
      if (targetTenderId) {
        await fetchQuotationDetails(targetTenderId, bidderAmounts);
      }
    } catch (error) {
      console.error('Error fetching bid details:', error);
      setError('Failed to fetch bid details. Please check the provided ID or Email.');
    }
  };

// Fetch quotation details from tender schema
const fetchQuotationDetails = async (targetTenderId, bidderAmounts) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tenders/id/${targetTenderId}`);
      const data = response.data;

    // Add status logic based on endDate
const today = new Date();
const endDate = data?.endDate ? new Date(data.endDate) : null;
if (endDate && endDate >= today) {  // Check if endDate is today or later
  data.status = 'Active';
} else {
  data.status = 'Inactive';
}

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
  }, [tenderId, email]); // Trigger on mount and if tenderId/email changes

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
              <div>No bids found for the given ID or Email.</div>
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

          <th>Proposed Amount</th> {/* Updated column heading */}


          <th>Bid Amount</th> {/* Added Bid Amount column */}
        </tr>
      </thead>


      <tbody>
  {quotationData.materials &&
    quotationData.materials.map((material, index) => (
      <tr key={index}>
        <td>{material}</td>
        <td>{quotationData.quantity[index]}</td>
        <td>{quotationData.TenderPropAmount[index]}</td>
        <td>
          {quotationData.BidderPropAmount ? (
            <span style={{ fontWeight: 'bold' }}>
              {quotationData.BidderPropAmount[index]}
            </span>
          ) : (
            'N/A'
          )}
        </td>
      </tr>
    ))}
</tbody>


    </table>
 

   
<div className='subAmou'>
                <div className="total-quotation" style={{ textAlign: 'left' }}>
                  <strong>Total Quotation Amount: </strong>
                  {quotationData?.Totalquotation}
                </div>
                <div className="total-bid-amount" style={{ textAlign: 'left' }}>
  <strong>Total Bid Amount: </strong>
  {/* Fetch and display Total Bid Amount */}
  {bidData.length > 0 ? bidData[0].bidAmount : 'N/A'} {/* Assuming bidAmount is part of the bid schema */}
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
