import React, { useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faIdCard, faEnvelope, faPhone, faDollarSign, faFile, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import './SubmitBidPage.css';
import Swal from 'sweetalert2';
import { useEffect } from 'react';


const SubmitBidPage = () => {
    const navigate = useNavigate();
    const { tenderId } = useParams();
    const [bidderName, setBidderName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyRegNumber, setCompanyRegNumber] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    
    const [expiryDate, setExpiryDate] = useState('');
    const [file, setFile] = useState(null);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [bidderId, setBidderId] = useState(null);
    const [tenderDetails, setTenderDetails] = useState(null);
    const [biddingAmounts, setBiddingAmounts] = useState([]);

useEffect(() => {
    const fetchTenderDetails = async () => {
        try {
            const response = await axios.get(`https://smart-tender-management-system.onrender.com/api/tenders/id/${tenderId}`);
            const tenderData = response.data;
            setTenderDetails({
                ...tenderData,
                biddingAmount: new Array(tenderData.materials.length).fill('') // Initialize bidding amounts
            });
            setBiddingAmounts(new Array(tenderData.materials.length).fill('')); // Initialize biddingAmounts with empty values
        } catch (err) {
            console.error('Failed to fetch tender details:', err);
        }
    };
    fetchTenderDetails();
}, [tenderId]); // Depend on tenderId

useEffect(() => {
    try {
        const storedUser = localStorage.getItem('user'); // Get 'user' key from localStorage
        if (storedUser) {
            const userObject = JSON.parse(storedUser); // Parse the JSON string
            if (userObject.email) {
                setEmail(userObject.email); // Extract and set the email
            } else {
                console.error("Email not found in user object");
            }
        } else {
            console.error("User data not found in localStorage");
        }
    } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
    }
}, []);


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!email) {
            setError('Email is missing. Please check if your email is saved in your profile.');
            return;
        }
    
        if (!acceptTerms) {
            setError('You must agree to the terms and conditions.');
            return;
        }
    
        // Calculate TotalBidAmount
        const totalBidAmount = tenderDetails?.materials?.reduce((total, _, index) => {
            const quantity = tenderDetails.quantity[index];
            const bidAmount = parseFloat(biddingAmounts[index]) || 0; // Handle empty or invalid values
            return total + quantity * bidAmount;
        }, 0).toFixed(2); // Sum of quantity x biddingAmount
    
        try {
            const formData = new FormData();
            formData.append('tenderId', tenderId);
            formData.append('bidderName', bidderName);
            formData.append('companyName', companyName);
            formData.append('companyRegNumber', companyRegNumber);
            formData.append('email', email);
            formData.append('phoneNumber', phoneNumber);
            formData.append('bidAmount', totalBidAmount); // Pass TotalBidAmount
            formData.append('description', description);
            formData.append('additionalNotes', additionalNotes);
            formData.append('expiryDate', expiryDate);
            formData.append('BidderPropAmount', JSON.stringify(biddingAmounts)); // Convert biddingAmounts to JSON
    
            if (file) formData.append('file', file);
    
            const response = await axios.post('https://smart-tender-management-system.onrender.com/api/bids', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
    
            const createdBidderId = response.data.bid._id;
            console.log(createdBidderId);
            setSuccess('Bid submitted successfully!');
            Swal.fire({
                title: "Bid Submitted Successfully!",
                text: `Bid submitted successfully! Bid-id :${createdBidderId}  by Email-id :${email}`,
                icon: "success",
                confirmButtonText: "OK"
            });
            setBidderId(createdBidderId);
            setError('');
            console.log(response.data);
    
            // Reset form fields
            setBidderName('');
            setCompanyName('');
            setCompanyRegNumber('');
            setEmail('');
            setPhoneNumber('');
            setDescription('');
            setAdditionalNotes('');
            setExpiryDate('');
            setFile(null);
            setAcceptTerms(false);
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            setError('Failed to submit bid: ' + message);
            setSuccess('');
        }
    };
    
    const openModal = (tenderId) => {
        setIsModalOpen(true);
      };

    const closeModal = () => {
        setIsModalOpen(false);
      };

    return ( 
    <div className='submit-bid-page-mega'>
        <div className="submit-bid-page-container">
            <h2>Submit Bid for Tender-id: {tenderId}</h2>
            <form onSubmit={handleSubmit}>
                <div className="submit-bid-form-group submit-bid-form-group-name">
                    <FontAwesomeIcon icon={faUser} className="form-icon" />
                    <input
                        type="text"
                        placeholder="Bidder's Full Name"
                        value={bidderName}
                        onChange={(e) => setBidderName(e.target.value)}
                        required
                    />
                </div>
                <div className="submit-bid-form-group submit-bid-form-group-company">
                    <FontAwesomeIcon icon={faBuilding} className="form-icon" />
                    <input
                        type="text"
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                    />
                </div>
                <div className="submit-bid-form-group submit-bid-form-group-regnumber">
                    <FontAwesomeIcon icon={faIdCard} className="form-icon" />
                    <input
                        type="text"
                        placeholder="Company Registration Number"
                        value={companyRegNumber}
                        onChange={(e) => setCompanyRegNumber(e.target.value)}
                    />
                </div>
                <div className="submit-bid-form-group submit-bid-form-group-phone">
                    <FontAwesomeIcon icon={faPhone} className="form-icon" />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>
                <textarea
                    className="submit-bid-textarea submit-bid-textarea-description"
                    placeholder="Bid Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>
                <textarea
                    className="submit-bid-textarea submit-bid-textarea-notes"
                    placeholder="Additional Notes (Optional)"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                ></textarea>
  <button className="AddQuotationHere"type="button" onClick={() => openModal(tenderId)}>
          Add Quotation Here
        </button>
                <label className="submit-bid-form-group submit-bid-form-group-expirydate">
                    <FontAwesomeIcon icon={faCalendarAlt} className="form-icon" />
                    Expiry Date:
                    <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        onFocus={(e) => e.target.showPicker()} // Trigger the date picker

                    />
                </label>
                <div className="submit-bid-form-group submit-bid-form-group-fileupload">
                    <FontAwesomeIcon icon={faFile} className="form-icon" />
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="*"
                    />
                </div>
                <label className="submit-bid-form-group submit-bid-form-group-terms">
                    <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={() => setAcceptTerms(!acceptTerms)}
                    />
                    <pre>I agree to the </pre><Link to="/terms-of-service">terms and conditions</Link>
                </label>
                <button type="submit" className="submit-bid-button" onClick={() => navigate(`/tender/submit/${tenderId}`)}>
                    Submit Bid
                </button>
            </form>
            {success && <p className="submit-bid-success-message">{success}</p>}
            {error && <p className="submit-bid-error-message">{error}</p>}
            {bidderId && (
                <div className="submit-bid-id-container">
                    <h2>Bid submitted!</h2>
                    <p>Your Bidder ID is: <strong>{bidderId}</strong></p>
                    <p>Save it for later!</p>
                </div>
            )}
            <Link to={`/tender/bid-details`} className="submit-bid-details-link">
                See bid details
            </Link>
        </div>
{/* Modal content replaced by AllTenderDetails component */}
{isModalOpen && tenderDetails && (
    <div className="quotation-page" style={{ textAlign: "left" }}>
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

                {/* Quotation Details */}
                <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "larger" }}>Quotation Details</p>
                <table style={{ textAlign: "left", width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Materials</th>
                            <th>Quantity</th>
                            <th>Proposed Amount</th>
                            <th>Bidding Amount</th> {/* New Column for Bidding Amount */}
                        </tr>
                    </thead>
                    <tbody>
                        {tenderDetails?.materials?.map((material, index) => (
                            <tr key={index}>
                                <td>{material}</td>
                                <td>{tenderDetails.quantity[index]}</td>
                                <td>{tenderDetails.TenderPropAmount[index]}</td>
                                <td>
                                    {/* Input field for Bidding Amount */}
                                    <input
                                        type="number"
                                        value={biddingAmounts[index] || ''} // If bidding amount is not set, show empty
                                        onChange={(e) => {
                                            const updatedBiddingAmounts = [...biddingAmounts]; // Clone the existing array
                                            updatedBiddingAmounts[index] = e.target.value; // Update the bidding amount for the corresponding index
                                            setBiddingAmounts(updatedBiddingAmounts); // Update the state with the new array
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table><div className='subAmou'>
                <div className="total-quotation" style={{ textAlign: "left" }}>
                    <strong>Total Quotation Amount: </strong>
                    {tenderDetails?.Totalquotation}
                </div>
                <div className="total-bid-amount">
                    <strong>Total Bid Amount: </strong>
                    {tenderDetails?.materials?.reduce((total, _, index) => {
                        const quantity = tenderDetails.quantity[index];
                        const bidAmount = parseFloat(biddingAmounts[index]) || 0; // Handle empty or invalid values
                        return total + quantity * bidAmount;
                    }, 0).toFixed(2)} {/* Sum of quantity x biddingAmount */}
                </div>
                </div>
            </div>
        </div>
    </div>
)}



        </div> );
   
};

export default SubmitBidPage;
