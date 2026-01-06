import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './UserDashboard.css';

function UserDashboard() {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const response = await api.get('/parking-lots');
      setParkingLots(response.data.data);
    } catch (err) {
      setError('Failed to load parking lots');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (lotId) => {
    navigate(`/lot/${lotId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-dashboard">
      <nav className="navbar">
        <h1>Smart Parking</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2>Available Parking Lots</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="parking-lots-grid">
          {parkingLots.length === 0 ? (
            <p>No parking lots available</p>
          ) : (
            parkingLots.map((lot) => (
              <div key={lot.id} className="parking-lot-card">
                <h3>{lot.name}</h3>
                <p className="location">{lot.location}</p>

                <div className="availability">
                  <div className="available-format">
                    <span className="availability-text">
                      {lot.availableSlots}/{lot.totalCapacity} available
                    </span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(lot.availableSlots / lot.totalCapacity) * 100}%`,
                      backgroundColor: lot.availableSlots > 5 ? '#4caf50' : '#f44336'
                    }}
                  ></div>
                </div>

                <button
                  onClick={() => handleViewDetails(lot.id)}
                  className="btn-view"
                  disabled={lot.availableSlots === 0}
                >
                  {lot.availableSlots > 0 ? 'View Details' : 'Full'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
