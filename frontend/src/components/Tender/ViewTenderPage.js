import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTenders } from '../../services/tenderService';
import './ViewTenderPage.css';

const ViewTenderPage = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null); // State for selected tender
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();

  useEffect(() => {
    const getTenders = async () => {
      try {
        const data = await fetchTenders();
        setTenders(data);
      } catch (err) {
        setError(`Failed to fetch tenders: ${err.message || err}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getTenders();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const currentDate = new Date();
  const isInactive = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < currentDate;
  };

  const openModal = (tender) => {
    setSelectedTender(tender);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTender(null);
    setIsModalOpen(false);
  };

  return (
    <div className="view-tender-page-container">
      <div className="view-tender-page-header-container">
        <button onClick={() => navigate(-1)} className="view-tender-page-back-button">
          ← Back
        </button>
        <h1 className="Click-On-Tender-To-Bid">Click On Tender To Bid</h1>
      </div>
      {tenders.length === 0 ? (
        <p className="view-tender-page-no-tender-message">No tenders available.</p>
      ) : (
        <div className="view-tender-page-list-container">
          {tenders.map((tender) => (
            <div
              key={tender._id}
              className="view-tender-page-card"
              onClick={() => openModal(tender)} // Open modal on click
            >
              <h2 className="view-tender-page-id">
                Tender ID: <span className="highlighted-text">{tender._id}</span>
              </h2>
              <h3 className="view-tender-page-title">{tender.title}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Modal content replaced by AllTenderDetails component */}
      {isModalOpen && selectedTender && (
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
              {/* Tender Details */}
              <h2 style={{ textAlign: "left" }}>Tender Details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Tender ID:</strong></label>
                  <span>{selectedTender?._id}</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Title:</strong></label>
                  <span>{selectedTender?.title}</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Created by:</strong></label>
                  <span>{selectedTender?.email}</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Description:</strong></label>
                  <span>{selectedTender?.description}</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Type:</strong></label>
                  <span>{selectedTender?.type}</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Status:</strong></label>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: isInactive(selectedTender?.endDate) ? "red" : "rgb(15, 176, 3)", // Check if inactive
                    }}
                  >
                    {isInactive(selectedTender?.endDate) ? "Inactive" : "Active"} {/* Display Active or Inactive based on endDate */}
                  </span>
                </div>


                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>Start Date:</strong></label>
                  <span>
                    {selectedTender?.startDate
                      ? new Date(selectedTender.startDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><strong>End Date:</strong></label>
                  <span>
                    {selectedTender?.endDate
                      ? new Date(selectedTender.endDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {selectedTender?.document && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label><strong>Document:</strong></label>
                    <a
                      href={`http://localhost:5000/${selectedTender.document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>

              {/* Quotation Details */}
              <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "larger" }}>Quotation Details</p>
              <table style={{ textAlign: "left", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Materials</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTender?.materials &&
                    selectedTender.materials.map((material, index) => (
                      <tr key={index}>
                        <td>{material}</td>
                        <td>{selectedTender.quantity[index]}</td>
                        <td>{selectedTender.TenderPropAmount[index]}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="total-quotation" style={{ textAlign: "left" }}>
                <strong>Total Quotation Amount: </strong>
                {selectedTender?.Totalquotation}
                <a href={`/tender/submit/${selectedTender._id}`} className="view-tender-page-submit-bid-link">
                  Submit Bid
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTenderPage;
