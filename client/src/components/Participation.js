import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Participation.css';

const Participation = () => {
  const [events, setEvents] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('not authenticated');
        const user = await res.json();
        setEvents(user.registeredEvents || []);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate, token]);

  return (
    <div className="participation-container">
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/dashboard')}>WHAT'SUPTKM</div>
        <div className="nav-links">
          <button className="community-btn" onClick={() => navigate('/community')}>Community</button>
        </div>
        <div className="user-menu" onClick={() => setShowMenu(!showMenu)}>
          <span className="username-display">{localStorage.getItem('username') || 'User'} ▼</span>
          {showMenu && (
            <div className="dropdown">
              <div className="dropdown-item" onClick={() => navigate('/profile')}>Profile</div>
              <div className="dropdown-item" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</div>
            </div>
          )}
        </div>
      </nav>

      <div className="events-list">
        {events.length === 0 ? (
          <p>You have not registered for any events.</p>
        ) : (
          events.map(ev => (
            <div key={ev._id} className="participation-card">
              {ev.image && <img src={ev.image} alt={ev.title} />}
              <h3>{ev.title}</h3>
              <p>{ev.date ? new Date(ev.date).toLocaleString() : ''}</p>
              {ev.location && <p>{ev.location}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Participation;