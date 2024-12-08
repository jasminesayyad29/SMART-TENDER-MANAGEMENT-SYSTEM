import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import './CreateTenderPage.css';

const CreateTenderPage = () => {
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('Active');
  const [document, setDocument] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [materials, setMaterials] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [TenderPropAmount, setTenderPropAmount] = useState([]);
  const [TotalQuotation, setTotalQuotation] = useState('');
  const [tenderId, setTenderId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.email) {
      setEmail(storedUser.email);
    }
  }, []);

  const addRow = () => {
    setMaterials([...materials, '']);
    setQuantities([...quantities, '']);
    setTenderPropAmount([...TenderPropAmount, '']);
    calculateTotalQuotation(TenderPropAmount, quantities); // Recalculate total quotation

  };

  const handleMaterialChange = (index, value) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = value;
    setMaterials(updatedMaterials);
  };

  const handleQuantityChange = (index, value) => {
    const updatedQuantities = [...quantities];
    updatedQuantities[index] = value;
    setQuantities(updatedQuantities);
  };

  const handleAmountChange = (index, value) => {
    const updatedAmounts = [...TenderPropAmount];
    updatedAmounts[index] = value;
    setTenderPropAmount(updatedAmounts);
    calculateTotalQuotation(updatedAmounts, quantities); // Pass both updatedAmounts and quantities
  };
  
  const calculateTotalQuotation = (amounts, quantities) => {
    const total = amounts.reduce((acc, amount, index) => {
      const quantity = parseFloat(quantities[index]) || 0;
      const amountValue = parseFloat(amount) || 0;
      return acc + quantity * amountValue; // Calculate quantity * amount for each row
    }, 0);
    setTotalQuotation(total.toFixed(2)); // Ensure two decimal places
  };
  

  const handleModalSubmit = () => {
    if (materials.some((m) => !m) || quantities.some((q) => !q) || TenderPropAmount.some((a) => !a)) {
      Swal.fire({
        title: 'Validation Error',
        text: 'All fields must be filled out.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }
    setShowModal(false);
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
    Swal.fire({
      title: 'Invalid Date',
      text: 'Ensure the end date is greater than the start date and both dates are valid.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    return;
  }

  if (materials.length === 0 || quantities.length === 0 || TenderPropAmount.length === 0) {
    Swal.fire({
      title: 'Validation Error',
      text: 'Please fill out tender Quotation before submitting.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    return;
  }

  // Create FormData for sending multipart data
  const formData = new FormData();
  formData.append('email', email);
  formData.append('title', title);
  formData.append('eligibility', eligibility);
  formData.append('description', description);
  formData.append('type', type);
  formData.append('status', status);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('document', document); // Include the uploaded document file

  // Append arrays using JSON strings (because Express `req.body` cannot handle nested objects/arrays directly in `multipart/form-data`)
  formData.append('materials', JSON.stringify(materials));
  formData.append('quantity', JSON.stringify(quantities));
  formData.append('TenderPropAmount', JSON.stringify(TenderPropAmount));
  formData.append('Totalquotation', TotalQuotation);

  try {
    const response = await axios.post('http://localhost:5000/api/tenders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Specify form-data for file uploads
      },
    });

    Swal.fire({
      title: 'Tender Created Successfully!',
      text: `Tender Created Successfully! with tenderId ${response.data._id}`,
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      window.location.reload();
    });
    setTenderId(response.data._id);

    // Send acknowledgment email after creating tender
    await sendAcknowledgmentEmail();
  } catch (error) {
    console.error('Error creating tender', error);
    Swal.fire({
      title: 'Tender Creation Failed!',
      text: 'Failed to create the tender',
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }
};

  const sendAcknowledgmentEmail = async () => {
    try {
      const biddersResponse = await axios.get('http://localhost:5000/api/bidders/emails');
      const bidderEmails = biddersResponse.data.emails;

      const recipients = Array.from(new Set([email, ...bidderEmails])); // Deduplicate emails
      const recipientsString = recipients.join(',');

      const emailParams = {
        to_emails: recipientsString,
        user_email: email,
        tender_title: title,
        tender_eligibility: eligibility,
        tender_description: description,
        tender_type: type,
        tender_status: status,
        tender_startDate: startDate,
        tender_endDate: endDate,
        total_quotation: TotalQuotation, // Add TotalQuotation to the email parameters
      };

      await emailjs.send('service_vnehurc', 'template_4qpjzma', emailParams, 'fn2uxIMhd1q5E1SW9');
    } catch (error) {
      console.error('Error sending email:', error);
      Swal.fire({
        title: 'Email Sending Failed',
        text: 'An error occurred while sending emails to bidders.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleDocumentChange = (e) => {
    setDocument(e.target.files[0]);
  };


  return (
    <div className="create-tender">
      <h1>Create Tender 📃</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eligibility">Eligibility Criteria</label>
          <textarea
            id="eligibility"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="Open">Open</option>
            <option value="Limited">Limited</option>
            <option value="Negotiated">Negotiated</option>
            <option value="Restricted">Restricted</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
        <div className="createdateparent">
  <div className="form-group">
    <label htmlFor="startDate">Start Date</label>
    <input
      type="date"
      id="startDate"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      onFocus={(e) => e.target.showPicker()} // Trigger the date picker
      required
    />
  </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onFocus={(e) => e.target.showPicker()} // Trigger the date picker

            required
          /></div>
        </div>
        <div className="form-group">
          <label htmlFor="document">Upload Document</label>
          <input type="file" id="document" onChange={handleDocumentChange} required />
        </div>
        <button type="button" onClick={() => setShowModal(true)}>
          Quotation
        </button>
        <div className="form-actions">
          <button type="submit">Create Tender</button>
        </div>
      </form>
      {tenderId && (
        <div>
          <h2>Tender Created!</h2>
          <p>
            Your tender ID is: <strong>{tenderId}</strong>
          </p>
          <p>Save it for Later!!</p>
        </div>
      )}
      <Link to="/admin/tender-management">Manage Tenders</Link>
     
      {showModal && (
  <div className="modal">
    <div className="modal-content">
      <h2>Tender Quotation</h2>
      <table>
        <thead>
          <tr>
            <th>Materials</th>
            <th>Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => {
                    handleMaterialChange(index, e.target.value);
                  }}
                  required
                />
              </td>
              <td>
                <input
                  type="number"
                  value={quantities[index]}
                  onChange={(e) => {
                    const updatedQuantities = [...quantities];
                    updatedQuantities[index] = parseInt(e.target.value, 10) || 0;
                    const newTotal = updatedQuantities.reduce(
                      (sum, qty, idx) =>
                        sum + qty * (TenderPropAmount[idx] || 0),
                      0
                    );
                    setQuantities(updatedQuantities);
                    setTotalQuotation(newTotal); // Update TotalQuotation dynamically
                  }}
                  required
                />
              </td>
              <td>
                <input
                  type="number"
                  value={TenderPropAmount[index]}
                  onChange={(e) => {
                    const updatedAmounts = [...TenderPropAmount];
                    updatedAmounts[index] = parseFloat(e.target.value) || 0;
                    const newTotal = quantities.reduce(
                      (sum, qty, idx) =>
                        sum + qty * (updatedAmounts[idx] || 0),
                      0
                    );
                    setTenderPropAmount(updatedAmounts);
                    setTotalQuotation(newTotal); // Update TotalQuotation dynamically
                  }}
                  required
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addRow}>
        Add Row
      </button>
      <div className="modal-actions">
        <button
          onClick={() => {
            handleModalSubmit(); // Existing submit logic
            // Send updated TotalQuotation to backend
            fetch('/update-total-quotation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ TotalQuotation }),
            });
          }}
        >
          Save
        </button>
        <button onClick={() => setShowModal(false)}>Cancel</button>
      </div>
      {/* Display Total Quotation in the modal */}
      <div className="total-quotation">
        <strong>Total Quotation Amount :</strong> {TotalQuotation}
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default CreateTenderPage;
