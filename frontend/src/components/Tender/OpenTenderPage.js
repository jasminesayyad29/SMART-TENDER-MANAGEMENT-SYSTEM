import React, { useEffect, useState } from 'react';
import { fetchTenders } from '../../services/tenderService';
import { useParams, useNavigate } from 'react-router-dom';
import './OpenTenderPage.css';

const OpenTenderPage = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tenderId } = useParams();
  const navigate = useNavigate(); // For back button navigation

  // Get today's date and time (for full comparison)
  const today = new Date();

  useEffect(() => {
    const getTenders = async () => {
      try {
        const data = await fetchTenders();
        // Sort tenders by createdAt in descending order
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTenders(sortedData);
      } catch (err) {
        setError(`Failed to fetch tenders: ${err.message || err}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getTenders();
  }, [tenderId]);

  // Count active and inactive tenders
  const activeTenders = tenders.filter(tender => new Date(tender.endDate) > today).length;
  const inactiveTenders = tenders.length - activeTenders;

  const handleQuotation = (tenderId) => {
    navigate(`/tender/quotation/${tenderId}`);
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tender-page-container">
      <button className="tender-page-container-back-button" onClick={handleBackClick}>← Back</button> {/* Back Button */}
      
    

      <h1>Tenders Open Now!</h1>
        {/* Status Box at the top */}
        <div className="tender-status-box">
        <div className="status-item active">
          <span className="status-label">Active Tenders</span>
          <span className="status-count">{activeTenders}</span>
        </div>
        <div className="status-item inactive">
          <span className="status-label">Inactive Tenders</span>
          <span className="status-count">{inactiveTenders}</span>
        </div>
      </div>
      {tenders.length === 0 ? (
        <p>No tenders available.</p>
      ) : (
        <div className="tender-page-card-container">
          {tenders.map((tender) => {
            // Parse the tender's endDate
            const tenderEndDate = new Date(tender.endDate); // Convert to Date object

            // If the tender's endDate is in the future (hasn't expired yet), set the color to green
            const cardColor = tenderEndDate > today ? '#4caf50' : '#f44336';

            return (
              <div
                key={tender._id}
                className="tender-page-card"
                style={{ backgroundColor: cardColor }} // Apply background color dynamically
                onClick={() => handleQuotation(tender._id)}
              >
                <h2><h3>Tender-id</h3>{tender._id}</h2>
                <h3><h3>Title</h3>{tender.title}</h3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpenTenderPage;
