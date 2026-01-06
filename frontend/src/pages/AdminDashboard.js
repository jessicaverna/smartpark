import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('lots');
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', totalCapacity: '' });
  const [selectedLot, setSelectedLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const response = await api.get('/parking-lots');
      setParkingLots(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load parking lots');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddLot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parking-lots', formData);
      setSuccess('Parking lot added successfully');
      setShowAddForm(false);
      setFormData({ name: '', location: '', totalCapacity: '' });
      fetchParkingLots();
    } catch (err) {
      setError('Failed to add parking lot');
    }
  };

  const handleEditLot = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/parking-lots/${editingLot}`, formData);
      setSuccess('Parking lot updated successfully');
      setEditingLot(null);
      setFormData({ name: '', location: '', totalCapacity: '' });
      fetchParkingLots();
    } catch (err) {
      setError('Failed to update parking lot');
    }
  };

  const handleDeleteLot = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking lot?')) {
      try {
        await api.delete(`/parking-lots/${id}`);
        setSuccess('Parking lot deleted successfully');
        fetchParkingLots();
      } catch (err) {
        setError('Failed to delete parking lot');
      }
    }
  };

  const startEdit = (lot) => {
    setEditingLot(lot.id);
    setFormData({ name: lot.name, location: lot.location, totalCapacity: lot.totalCapacity });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingLot(null);
    setFormData({ name: '', location: '', totalCapacity: '' });
  };

  const fetchSlots = async (lotId) => {
    setLoadingSlots(true);
    try {
      const response = await api.get(`/slots/lot/${lotId}`);
      setSlots(response.data.data.slots);
      setSelectedLot(lotId);
      setError('');
    } catch (err) {
      setError('Failed to load parking slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleUpdateSlotStatus = async (slotId, newStatus) => {
    try {
      await api.put(`/slots/${slotId}/status`, { status: newStatus });
      setSuccess('Slot status updated successfully');
      fetchSlots(selectedLot);
    } catch (err) {
      setError('Failed to update slot status');
    }
  };

  const handleSimulateIoT = async () => {
    if (!selectedLot) return;
    try {
      await api.post(`/slots/simulate/${selectedLot}`);
      setSuccess('IoT simulation completed');
      fetchSlots(selectedLot);
    } catch (err) {
      setError('Failed to simulate IoT');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <h1>Smart Parking - Admin</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'lots' ? 'active' : ''}`}
            onClick={() => setActiveTab('lots')}
          >
            Parking Lots
          </button>
          <button
            className={`tab ${activeTab === 'slots' ? 'active' : ''}`}
            onClick={() => setActiveTab('slots')}
          >
            Parking Slots
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'lots' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Manage Parking Lots</h2>
              <button
                className="btn-add"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingLot(null);
                  setFormData({ name: '', location: '', totalCapacity: '' });
                }}
              >
                {showAddForm ? 'Cancel' : '+ Add New Lot'}
              </button>
            </div>

            {showAddForm && (
              <form className="lot-form" onSubmit={handleAddLot}>
                <input
                  type="text"
                  placeholder="Parking Lot Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  minLength="3"
                  maxLength="50"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  minLength="5"
                  maxLength="100"
                  required
                />
                <input
                  type="number"
                  placeholder="Total Capacity (10-15)"
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                  min="10"
                  max="15"
                  required
                />
                <button type="submit" className="btn-submit">Add Parking Lot</button>
              </form>
            )}

            <div className="lots-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Total Capacity</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parkingLots.map((lot) => (
                    <tr key={lot.id}>
                      <td>
                        {editingLot === lot.id ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        ) : (
                          lot.name
                        )}
                      </td>
                      <td>
                        {editingLot === lot.id ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                        ) : (
                          lot.location
                        )}
                      </td>
                      <td>
                        {editingLot === lot.id ? (
                          <input
                            type="number"
                            value={formData.totalCapacity}
                            onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                          />
                        ) : (
                          lot.totalCapacity
                        )}
                      </td>
                      <td>{lot.availableSlots}</td>
                      <td className="actions">
                        {editingLot === lot.id ? (
                          <>
                            <button className="btn-save" onClick={handleEditLot}>Save</button>
                            <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-edit" onClick={() => startEdit(lot)}>Edit</button>
                            <button className="btn-delete" onClick={() => handleDeleteLot(lot.id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Manage Parking Slots</h2>
              {selectedLot && (
                <button className="btn-simulate" onClick={handleSimulateIoT}>
                  Simulate IoT Sensor
                </button>
              )}
            </div>

            <div className="lot-selector">
              <label>Select Parking Lot:</label>
              <select
                value={selectedLot || ''}
                onChange={(e) => fetchSlots(e.target.value)}
              >
                <option value="">-- Choose a parking lot --</option>
                {parkingLots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name} - {lot.location}
                  </option>
                ))}
              </select>
            </div>

            {loadingSlots && <p>Loading slots...</p>}

            {selectedLot && !loadingSlots && (
              <div className="slots-management">
                <div className="slots-grid-admin">
                  {slots.map((slot) => (
                    <div key={slot._id} className={`slot-card-admin ${slot.status.toLowerCase()}`}>
                      <div className="slot-number">{slot.spotNumber}</div>
                      <div className="slot-status">{slot.status}</div>
                      <select
                        value={slot.status}
                        onChange={(e) => handleUpdateSlotStatus(slot._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="RESERVED">Reserved</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
