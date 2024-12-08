import React, { useEffect, useState } from 'react';
import { fetchTendersbymail, fetchBidsByTenderId } from '../../services/tenderService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './TenderManagementPage.css';

const TenderManagementPage = () => {
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidError, setBidError] = useState(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isBidDetailsModalOpen, setIsBidDetailsModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [quotationData, setQuotationData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const email = storedUser?.email;

    if (!email) {
      setError("User email not found in localStorage.");
      setLoading(false);
      return;
    }

    const getTenders = async () => {
      try {
        const data = await fetchTendersbymail(email);
        const updatedTenders = data.map(tender => {
          const endDate = new Date(tender.endDate);
          const currentDate = new Date();

          if (endDate < currentDate && tender.status !== "Inactive") {
            return { ...tender, status: "Inactive" };
          }
          return tender;
        });

        setTenders(updatedTenders);
      } catch (err) {
        setError(`Failed to fetch tenders: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    getTenders();
  }, []);

  const handleBids = async (tenderId) => {
    setSelectedTenderId(tenderId);
    try {
      const fetchedBids = await fetchBidsByTenderId(tenderId);
      setBids(fetchedBids);
      setBidError(null);
    } catch (error) {
      console.error("Error fetching bids:", error);
      setBidError("Oops..");
    } finally {
      setIsBidModalOpen(true); // Open the bid modal regardless of whether there are bids
    }
  };

  const fetchQuotationDetails = async (bid) => {
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
      setBidError('Failed to fetch quotation details.');
    }
  };
  

  const handleBidDetails = async (bid) => {
    setSelectedBid(bid);
    await fetchQuotationDetails(bid); // Fetch quotation details when bid is selected
    setIsBidDetailsModalOpen(true);
  };
  

  const handleCloseBidModal = () => {
    setIsBidModalOpen(false);
    setSelectedTenderId(null);
    setBids([]);
  };

  const getStatusText = (expiryDate) => {
    if (!expiryDate) return 'Inactive'; // Default to Inactive if expiryDate is missing
  
    const today = new Date();
    const expiry = new Date(expiryDate);
  
    return today <= expiry ? 'Active' : 'Inactive';
  };
  
  const getStatusColor = (expiryDate) => {
    const status = getStatusText(expiryDate);
    return status === 'Active' ? 'green' : 'red';
  };
  
  

  const handleCloseBidDetailsModal = () => {
    setIsBidDetailsModalOpen(false);
    setSelectedBid(null);
  };

  const handleDelete = (tenderId) => {
    navigate(`/tender/delete/${tenderId}`);
  };

  const handleQuotation = (tenderId) => {
    navigate(`/tender/quotation/${tenderId}`);
  };

  const handleEdit = (tenderId) => {
    navigate(`/tender/modify/${tenderId}`);
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "Invalid Date" : parsedDate.toLocaleDateString();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (<>
    <div className="tender-management-container">
      <h2>Manage Your Tenders</h2>
      <table className="tender-table">
        <thead>
          <tr>
            <th>Sr. No.</th> {/* Add this header for serial number */}
            <th>Tender ID</th>
            <th>Title</th>
            <th>Quotation Amount</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody className="table-body">
          {tenders.length > 0 ? (
            tenders.map((tender, index) => (
              <tr key={tender._id}>
                <td>{index + 1}</td> {/* Serial number */}
                <td>{tender._id}</td>
                <td><span style={{ fontWeight: 'bold' }}>{tender.title}</span>    <p>
                  <button className='tmqdetail' onClick={() => handleQuotation(tender._id)}>All Details</button>
               
                </p></td>



                <td>   
            <span style={{ fontWeight: 'bold' }}>{tender.Totalquotation}</span>  <br /> <p>                 
                </p>
                </td>



                <td>{formatDate(tender.startDate)}</td>
                <td>{formatDate(tender.endDate)}</td>
                <td
  className={
    tender.status === "Inactive"
      ? "status inactive-status"
      : tender.status === "Active"
      ? "status active-status"
      : ""
  }
>
  {tender.status}
</td>

                <td>
                  <button onClick={() => handleBids(tender._id)}>View Bids</button>
                  <button onClick={() => handleEdit(tender._id)}>Modify</button>
                  <button onClick={() => handleDelete(tender._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No tenders available</td>
            </tr>
          )}
        </tbody>

      </table>

      {/* Bids List Modal */}
      {isBidModalOpen && (
        <div className="modal-overlay-tender-management">
          <div className="modal-container-tender-management">
            <h3>Bids for Selected Tender</h3>
            <button className="close-btn-tender-management" onClick={handleCloseBidModal}>X</button>
            {bidError && <p>{bidError}</p>}
            {bids.length > 0 ? (
              <ul>
                {bids.map((bid, index) => (
                  <li key={index} className="bid-item-tender-management">
                    <span className="bidder-name-tender-management"><strong>Bidder:</strong> {bid.bidderName}</span>
                    <button onClick={() => handleBidDetails(bid)}>View Bid Details</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Bids For This Tender</p> // Show this message if there are no bids
            )}
          </div>
        </div>
      )}



   {/* Bid Details Modal */}
{isBidDetailsModalOpen && selectedBid && (
  <div className="modal-overlay-tender-management">
    <div className="modal-container-tender-management">
      <h2 className='ysbj'>Bid Details</h2>
      <button className="close-btn-tender-management" onClick={handleCloseBidDetailsModal}>X</button>

      {/* Bid Details */}
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
  <span style={{ fontWeight: 'bold', color: getStatusColor(selectedBid.expiryDate) }}>
    {getStatusText(selectedBid.expiryDate)}
  </span>
</div>


        </div>
      </div>

      {/* Quotation Details */}
      {quotationData && (
        <div>
          <h2 className='ysbj'>Quotation Details</h2>
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
    <ul className="createnewt" style={{ listStyleType: 'none', padding: 0 }}>
      <li>
        <Link to="/tender/create" className="admin-dashboard-link">Create A Tender</Link>
      </li>
    </ul>

    <br /> <br />  </>
  );
};

export default TenderManagementPage;
