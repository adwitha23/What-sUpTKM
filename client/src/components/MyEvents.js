import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './Dashboard.css';
import './Auth.css';

export default function MyEvents() {
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
        alert('Could not load events');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleEdit = (ev) => {
    navigate('/eventmanagement', { state: { event: ev } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await API.delete(`/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents((prev) => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

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
            onClick={() => navigate('/clubstats')}
            style={{ marginLeft: '10px' }}
          >
            Club Stats
          </button>
        </div>
        <div className="user-menu">
          {/* blank menu placeholder */}
        </div>
      </nav>
    <div className="auth-container">
      <div className="glass-card" style={{ maxWidth: '800px', width: '100%' }}>
        <h2>My Events</h2>
        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events created yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => {
                const isPast = ev.date < todayStr;
                return (
                  <tr key={ev._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td>
                      <img
                        src={ev.image && !ev.image.startsWith('http') ? `http://localhost:5000${ev.image}` : ev.image}
                        alt="cover" style={{width:60,height:40,objectFit:'cover',borderRadius:4}}
                      />
                    </td>
                    <td>{ev.title}</td>
                    <td>{ev.date}</td>
                    <td>
                      <button
                        className="submit-btn"
                        style={{marginRight:8}}
                        onClick={() => handleEdit(ev)}
                        disabled={isPast}
                      >
                        Edit
                      </button>
                      <button
                        className="submit-btn"
                        onClick={() => handleDelete(ev._id)}
                        disabled={isPast}
                        style={{background:'#f87171'}}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </div>
  );
}
