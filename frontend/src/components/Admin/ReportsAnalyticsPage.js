import React, { useEffect, useState } from 'react';
import { fetchTendersbymail, fetchBidsByTenderId, fetchScoreByBidId } from '../../services/tenderService';
import './ReportsAnalyticsPage.css';

const ReportsAnalyticsPage = () => {
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [bidScores, setBidScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidCharts, setBidCharts] = useState({});
  const [tenderChartUrl, setTenderChartUrl] = useState('');
  const [bidAmountChartUrl, setBidAmountChartUrl] = useState('');
  const [showChartModal, setShowChartModal] = useState(false);
  const [currentChartUrl, setCurrentChartUrl] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const email = storedUser?.email;

    if (!email) {
      setError('User email not found in localStorage.');
      setLoading(false);
      return;
    }

    const getTenders = async () => {
      try {
        const tendersData = await fetchTendersbymail(email);
        setTenders(tendersData);
        tendersData.forEach((tender) => getBidsForTender(tender._id));
      } catch (err) {
        setError("No Tenders Available");
      } finally {
        setLoading(false);
      }
    };

    getTenders();
  }, []);

  const getBidsForTender = async (tenderId) => {
    try {
      const fetchedBids = await fetchBidsByTenderId(tenderId);
      setBids((prevBids) => [
        ...prevBids.filter((bid) => bid.tenderId !== tenderId),
        ...fetchedBids.map((bid) => ({ ...bid, tenderId })),
      ]);
      fetchedBids.forEach((bid) => fetchAndSetBidScore(bid._id));
    } catch (err) {
      setError('Failed to fetch bids for this tender.');
    }
  };

  const fetchAndSetBidScore = async (bidId) => {
    try {
      const scoreData = await fetchScoreByBidId(bidId);
      setBidScores((prevScores) => ({
        ...prevScores,
        [bidId]: scoreData?.evaluationScore || 0,
      }));
    } catch (err) {
      console.error(`Failed to fetch score for bid ${bidId}: ${err.message}`);
    }
  };

  const generateBidChartForTender = (tenderId) => {
    const tenderBids = bids.filter(bid => bid.tenderId === tenderId);
    const labels = tenderBids.map(bid => `${bid.bidderName} (${bid.bidAmount})`);
    const data = tenderBids.map(bid => bidScores[bid._id] || 0);

    const chartConfig = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Bid Evaluation Scores',
            data: data,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = labels[tooltipItem.dataIndex];
                const score = data[tooltipItem.dataIndex];
                return `${label}: ${score} (Score)`;
              },
            },
          },
        },
      },
    };

    const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    setBidCharts((prevCharts) => ({ ...prevCharts, [tenderId]: url }));
    handleOpenModal(url);
  };

  const generateAggregateCharts = () => {
    generateTenderChartUrl();
    generateBidAmountChartUrl();
  };

  const generateTenderChartUrl = () => {
    const statusCounts = tenders.reduce((acc, tender) => {
      acc[tender.status] = (acc[tender.status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const chartConfig = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tender Status Distribution',
            data: data,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          },
        ],
      },
    };

    const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    setTenderChartUrl(url);
  };

  const generateBidAmountChartUrl = () => {
    const labels = bids.map(bid => bid.bidderName);
    const data = bids.map(bid => bid.bidAmount);

    const chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Bid Amounts',
            data: data,
            backgroundColor: ['#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    setBidAmountChartUrl(url);
  };

  useEffect(() => {
    generateAggregateCharts();
  }, [tenders, bids]);

  const handleOpenModal = (chartUrl) => {
    setCurrentChartUrl(chartUrl);
    setShowChartModal(true);
  };

  const handleCloseModal = () => {
    setShowChartModal(false);
    setCurrentChartUrl('');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="report-card">
      <h1 className="reports-analytics-header">Reports and Analysis</h1>

      <div className="tablecontainer">
        <h2>Tender List with Individual Bid Charts</h2>
        {tenders.length > 0 ? (
          <table className="tendertable">
            <thead>
              <tr>
                <th>Tender Title</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Bid Score Chart</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender) => (
                <tr key={tender._id}>
                  <td>{tender.title}</td>
                  <td>{new Date(tender.startDate).toLocaleDateString()}</td>
                  <td>{new Date(tender.endDate).toLocaleDateString()}</td>
                  <td>{tender.status}</td>
                  <td>
                    <button onClick={() => generateBidChartForTender(tender._id)}>
                      Generate Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tenders available.</p>
        )}
      </div>

      <div className="tablecontainer">
        <h2>All Bids</h2>
        {bids.length > 0 ? (
          <table className="bidstable">
            <thead>
              <tr>
                <th>Tender Title</th>
                <th>Bidder Name</th>
                <th>Bid Amount</th>
                <th>Evaluation Score</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => (
                <tr key={bid._id}>
                  <td>{tenders.find((tender) => tender._id === bid.tenderId)?.title || 'N/A'}</td>
                  <td>{bid.bidderName}</td>
                  <td>{bid.bidAmount}</td>
                  <td>{bidScores[bid._id] ? bidScores[bid._id].toFixed(3) : 'Not Scored'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bids available.</p>
        )}
      </div>

      <h2>Aggregate Charts</h2>
      <div className="tablecontainerfinal">
        {tenderChartUrl && (
          <div className="tenderdownload">
            <h3>Tender Status Chart:</h3>
            <img src={tenderChartUrl} alt="Tender Status Chart" style={{ width: '95%', height: '95%' }} />
            <button className="jasmine">
              <a href={tenderChartUrl} download="tender_status_chart.jpg">View & download</a>
            </button>
          </div>
        )}
        {bidAmountChartUrl && (
          <div className="biddownload">
            <h3>Bid Amount Chart:</h3>
            <img src={bidAmountChartUrl} alt="Bid Amount Chart" style={{ width: '95%', height: '95%' }} />
            <button className="jasmine">
              <a href={bidAmountChartUrl} download="bid_amount_chart.jpg">View & download</a>
            </button>
          </div>
        )}
      </div>

      {showChartModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseModal}>X</button>
            <img src={currentChartUrl} alt="Chart" style={{ width: '80%', height: 'auto' }} />
            <button className="aadarsh">
              <a href={currentChartUrl} download="generated_chart.jpg">Download Chart</a>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalyticsPage;
