import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './LotDetailView.css';

function LotDetailView() {
  const { lotId } = useParams();
  const [lotData, setLotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLotDetails();
  }, [lotId]);

  const fetchLotDetails = async () => {
    try {
      const response = await api.get(`/slots/lot/${lotId}`);
      setLotData(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load parking lot details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !lotData) {
    return (
      <div className="error-container">
        <p>{error || 'Parking lot not found'}</p>
        <button onClick={handleBack}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="lot-detail-view">
      <nav className="navbar">
        <h1>Smart Parking</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="container">
        <button onClick={handleBack} className="btn-back">← Back to Dashboard</button>

        <div className="lot-header">
          <h2>{lotData.parkingLot.name}</h2>
          <p className="location">{lotData.parkingLot.location}</p>
        </div>

        <div className="summary-cards">
          <div className="summary-card available">
            <span className="number">{lotData.summary.available}</span>
            <span className="label">Available</span>
          </div>
          <div className="summary-card occupied">
            <span className="number">{lotData.summary.occupied}</span>
            <span className="label">Occupied</span>
          </div>
          <div className="summary-card reserved">
            <span className="number">{lotData.summary.reserved}</span>
            <span className="label">Reserved</span>
          </div>
          <div className="summary-card total">
            <span className="number">{lotData.summary.total}</span>
            <span className="label">Total</span>
          </div>
        </div>

        <h3>Parking Spots</h3>
        <div className="slots-grid">
          {lotData.slots.map((slot) => (
            <div
              key={slot._id}
              className={`slot-card ${slot.status.toLowerCase()}`}
            >
              <div className="slot-number">{slot.spotNumber}</div>
              <div className="slot-status">{slot.status}</div>
              {slot.floor && <div className="slot-info">{slot.floor}</div>}
            </div>
          ))}
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <div className="legend-color reserved"></div>
            <span>Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LotDetailView;
