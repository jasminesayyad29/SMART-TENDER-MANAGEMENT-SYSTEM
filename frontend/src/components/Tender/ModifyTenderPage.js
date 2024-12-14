import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ModifyTenderPage.css';
import Swal from 'sweetalert2';

const ModifyTenderPage = () => {
  const navigate = useNavigate();
  const { tenderId: urlTenderId } = useParams(); // Get the tenderId from the URL
  const [tenderId, setTenderId] = useState('');  // State to hold user input for tenderId
  const [tenderDetails, setTenderDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [quotationData, setQuotationData] = useState(null); // State for quotation data
  const [showModal, setShowModal] = useState(false); // State to control the modal visibility
  const [originalDocument, setOriginalDocument] = useState(null); // State to store the original document




  // Fetch tender details based on tenderId
  const fetchTenderDetails = async (id) => {
    try {
      const response = await axios.get(`https://smart-tender-management-system.onrender.com/api/tenders/id/${id}`);
      const fetchedTender = response.data;

      // Convert materials, quantity, and TenderPropAmount to arrays if they are strings
      if (typeof fetchedTender.materials === 'string') {
        fetchedTender.materials = JSON.parse(fetchedTender.materials);
      }
      if (typeof fetchedTender.quantity === 'string') {
        fetchedTender.quantity = JSON.parse(fetchedTender.quantity);
      }
      if (typeof fetchedTender.TenderPropAmount === 'string') {
        fetchedTender.TenderPropAmount = JSON.parse(fetchedTender.TenderPropAmount);
      }

      setTenderDetails(fetchedTender);  // Populate form fields with fetched tender details
      setOriginalDocument(fetchedTender.document);  // Store the original document path from DB
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching tender details:', error);
      setErrorMessage('Error fetching tender details. Please check the Tender ID.');
      setTenderDetails(null);  // Clear form if fetching fails
    }
  };




  // Handle change in tenderId input field
  const handleTenderIdChange = (e) => {
    setTenderId(e.target.value);
  };

  // Handle form input change (for modifying tender details)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTenderDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle document file change


  
  const handleDocumentChange = (e) => {
    const newDocument = e.target.files[0];
    
    // Only update the state if a new document is selected
    if (newDocument) {
      setTenderDetails((prevState) => ({
        ...prevState,
        document: newDocument, // Update with the new document
      }));
    }
  };
  
 
 // Handle form submission (updating tender details)
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('email', tenderDetails.email);
  formData.append('title', tenderDetails.title);
  formData.append('eligibility', tenderDetails.eligibility);
  formData.append('description', tenderDetails.description);
  formData.append('type', tenderDetails.type);
  formData.append('status', tenderDetails.status || 'Active');  // Ensure status is either provided or defaults to 'Active'
  formData.append('startDate', tenderDetails.startDate);
  formData.append('endDate', tenderDetails.endDate);
  if (tenderDetails.materials) {
    formData.append('materials', JSON.stringify(tenderDetails.materials));  // Convert materials array to JSON string
  }
  if (tenderDetails.quantity) {
    formData.append('quantity', JSON.stringify(tenderDetails.quantity));  // Convert quantity array to JSON string
  }
  if (tenderDetails.TenderPropAmount) {
    formData.append('TenderPropAmount', JSON.stringify(tenderDetails.TenderPropAmount));  // Convert TenderPropAmount array to JSON string
  }
  formData.append('Totalquotation', tenderDetails.Totalquotation);

  // Append the new document if it exists, or append the original document from the database
  if (tenderDetails.document && tenderDetails.document instanceof File) {
    formData.append('document', tenderDetails.document); // Append the new document if it's a File
  } else {
    formData.append('document', originalDocument); // Append the original document from the DB
  }

  try {
    const response = await axios.put(`https://smart-tender-management-system.onrender.com/api/tenders/${urlTenderId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    Swal.fire({
      title: "Tender Modified Successfully!",
      icon: "success",
      confirmButtonText: "OK"
    });
    setSuccessMessage('Tender has been successfully modified!');
    setErrorMessage('');
    setTimeout(() => {
      navigate('/admin/tender-management');
    }, 2000);
  } catch (error) {
    Swal.fire({
      title: "OOPs!!Error while Modifying this tender",
      icon: "error",
      confirmButtonText: "OK"
    });
    console.error('Error updating tender:', error);
    setErrorMessage('Failed to update the tender.');
    setSuccessMessage('');
  }
};


  // Check if the input tenderId matches the one from the URL
  const handleModifyTender = () => {
    if (tenderId === urlTenderId) {
      fetchTenderDetails(tenderId);  // Fetch the details if tenderId matches
    } else {
      setErrorMessage('Tender ID does not match the Above ID.');
      setTenderDetails(null);  // Clear the form if IDs don't match
    }
  };

  // Fetch tender quotation details based on Tender ID
  const fetchTenderQuotation = async () => {
    if (!tenderId) {
      setErrorMessage('Please enter a valid Tender ID.');
      return;
    }

    try {
      const response = await axios.get(`https://smart-tender-management-system.onrender.com/api/tenders/id/${tenderId}`);
      setQuotationData(response.data); // Store the fetched data
      setErrorMessage('');
      setShowModal(true); // Show modal after data is fetched
    } catch (error) {
      console.error('Error fetching tender details:', error);
      setErrorMessage('Failed to fetch the quotation details. Please check the Tender ID.');
    }
  };

  return (
    <><br /><br />
      <br />
      <div className="modify-tender-page">
        <h1>Modify Tender</h1>
        <h3>
          for Tender-id: <span style={{ fontWeight: 'bold' }}>{urlTenderId}</span>
        </h3>

        {/* Step 1: Tender ID Input */}
        <div className="reenter">
          <label htmlFor="tenderId">Re-Enter Above Tender ID:</label>
          <input
            type="text"
            id="tenderId"
            value={tenderId}
            onChange={handleTenderIdChange}  // Handle input change
            required
          />
          <button className='modifybutton' onClick={handleModifyTender}>Modify this Tender</button>
        </div>


        {/* Step 2: Display Messages */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Step 3: Tender Modification Form (displayed only if tenderDetails is loaded) */}
        {tenderDetails && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={tenderDetails.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eligibility">Eligibility</label>
              <textarea
                id="eligibility"
                name="eligibility"
                value={tenderDetails.eligibility}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={tenderDetails.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={tenderDetails.type}
                onChange={handleInputChange}
                required
              >
                <option value="Open">Open</option>
                <option value="Limited">Limited</option>
                <option value="Negotiated">Negotiated</option>
                <option value="Restricted">Restricted</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div className='createdateparent'>
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={tenderDetails && tenderDetails.startDate ? tenderDetails.startDate.split('T')[0] : ''}  // Ensure proper date format
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.showPicker()} // Trigger the date picker

                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={tenderDetails && tenderDetails.endDate ? tenderDetails.endDate.split('T')[0] : ''}  // Ensure proper date format
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.showPicker()} // Trigger the date picker

                  required
                />
              </div>
            </div>

            {/* Quotation Button */}
            <div className="form-group">
              <button type="button" onClick={fetchTenderQuotation}>Quotation</button>
            </div>
            <div className="form-group">
  <label htmlFor="document">Upload Document</label>
  {tenderDetails && tenderDetails.document && (
    <div>
      <h4>
        Current Document:{" "}
        <a
          href={
            tenderDetails.document instanceof File
              ? URL.createObjectURL(tenderDetails.document) // Use temporary object URL for File objects
              : `https://smart-tender-management-system.onrender.com/${tenderDetails.document}` // Assuming this is the file path in your backend
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          View Document
        </a>
      </h4>
      <h3>Upload A New One, Or the Above File Here 👇</h3>
    </div>
  )}
  <input type="file" id="document" onChange={handleDocumentChange} required />
</div>


            <div className="form-actions">
              <button type="submit">Update Tender</button>
            </div>
          </form>
        )}
        {/* Modal to display and edit quotation data */}
        {showModal && tenderDetails && (
          <div className="modal">
            <div className="modal-content">
              <h2>
                Tender Quotation for ID: <span style={{ color: 'black' }}>{tenderId}</span>
              </h2>

              {/* Editable Table */}
              <table>
                <thead>
                  <tr>
                    <th>Materials</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tenderDetails.materials &&
                    tenderDetails.materials.map((material, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={material}
                            onChange={(e) => {
                              const updatedMaterials = [...tenderDetails.materials];
                              updatedMaterials[index] = e.target.value;
                              setTenderDetails((prevState) => ({
                                ...prevState,
                                materials: updatedMaterials,
                              }));
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={tenderDetails.quantity[index]}
                            onChange={(e) => {
                              const updatedQuantity = [...tenderDetails.quantity];
                              updatedQuantity[index] = parseInt(e.target.value, 10);
                              const updatedTotal = updatedQuantity.reduce(
                                (sum, qty, idx) =>
                                  sum +
                                  qty * (tenderDetails.TenderPropAmount[idx] || 0),
                                0
                              );
                              setTenderDetails((prevState) => ({
                                ...prevState,
                                quantity: updatedQuantity,
                                Totalquotation: updatedTotal,
                              }));
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={tenderDetails.TenderPropAmount[index]}
                            onChange={(e) => {
                              const updatedAmounts = [...tenderDetails.TenderPropAmount];
                              updatedAmounts[index] = parseFloat(e.target.value);
                              const updatedTotal = tenderDetails.quantity.reduce(
                                (sum, qty, idx) =>
                                  sum +
                                  qty * (updatedAmounts[idx] || 0),
                                0
                              );
                              setTenderDetails((prevState) => ({
                                ...prevState,
                                TenderPropAmount: updatedAmounts,
                                Totalquotation: updatedTotal,
                              }));
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => {
                  setTenderDetails((prevState) => ({
                    ...prevState,
                    materials: [...prevState.materials, ""],
                    quantity: [...prevState.quantity, 0],
                    TenderPropAmount: [...prevState.TenderPropAmount, 0],
                  }));
                }}
              >
                Add Row
              </button>

              <div className="total-quotation">
                <strong>Total Quotation Amount: </strong>
                {tenderDetails.Totalquotation}
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    // Send updated tender details to the backend
                    fetch("/update-tender-details", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(tenderDetails),
                    });
                    setShowModal(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
      <br /><br />
      <br />
      <br /></>
  );
};

export default ModifyTenderPage;
