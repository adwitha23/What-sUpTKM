import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Auth.css';

export default function ClubStats() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const res = await API.get(`/events/club/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEvents(res.data || []);
      } catch (e) {
        console.error(e);
        alert('Could not fetch club events');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      {/* navbar for execom user */}
      <nav className="navbar">
        <div className="logo">WHAT'SUPTKM</div>
        <div className="nav-links">
          <button
            className="community-btn"
            onClick={() => navigate('/community')}
          >
            Community
          </button>
          <button
            className="community-btn"
            onClick={() => navigate('/liveevents')}
            style={{ marginLeft: '10px' }}
          >
            Live Events
          </button>
        </div>
        <div className="user-menu" onClick={() => {}}
          >
          {/* blank menu placeholder */}
        </div>
      </nav>
    <div className="auth-container">
      <div className="glass-card" style={{ maxWidth: '900px', width: '100%' }}>
        <h2>Club Statistics</h2>
        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Registrations</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td>{ev.title}</td>
                  <td>{ev.date}</td>
                  <td>{ev.location}</td>
                  <td>{(ev.registeredStudents||[]).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{marginTop:16}}>
          <button className="submit-btn" onClick={() => navigate('/execomhub')}>Back</button>
        </div>
      </div>
    </div>
    </div>
  );
}
