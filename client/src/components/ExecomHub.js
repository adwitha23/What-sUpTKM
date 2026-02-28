import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './Auth.css';
import './Dashboard.css';

// ExecomHub shows navbar like student Dashboard and two central action cards

const ExecomHub = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetch = async () => {
      if (!user?._id) return setLoading(false);
      try{
        const res = await API.get(`/events/club/${user._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const today = new Date().toISOString().split('T')[0];
        const list = (res.data || []).filter(ev => (ev.date || '') >= today);
        setUpcomingEvents(list);
      }catch(e){ console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user?._id]);

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
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
            style={{marginLeft:'10px'}}
          >
            Club Stats
          </button>
        </div>

        <div
          className="user-menu"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="username-display">
            {user?.username || 'Execom'} ▼
          </span>

          {showMenu && (
            <div className="dropdown">
              <div
                className="dropdown-item"
                onClick={() => navigate('/profile')}
              >
                Profile
              </div>
              <div
                className="dropdown-item"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </nav>

      <div style={{display:'flex', justifyContent:'center', padding:'60px 20px'}}>
        <div className="glass-card" style={{width:'100%', maxWidth:1000}}>
          <h1 style={{marginTop:0}}>Welcome, {user?.username || 'Execom Member'}</h1>
          <p style={{color:'#cbd5e1'}}>Manage your club's presence on campus</p>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20, marginTop:24}}>
            <div className="hub-card" onClick={() => navigate('/eventmanagement')}>
              <h3>Event Management</h3>
              <p>Create new events, book classrooms, and manage registrations.</p>
            </div>

            <div className="hub-card" onClick={() => navigate('/liveevents')}>
              <h3>Live Operations</h3>
              <p>{loading ? 'Loading...' : `${upcomingEvents.length} upcoming events`}</p>
            </div>

            <div className="hub-card" onClick={() => navigate('/myevents')}>
              <h3>My Events</h3>
              <p>View and modify your existing events</p>
            </div>

            <div className="hub-card" onClick={() => navigate('/clubstats')}>
              <h3>Club Stats</h3>
              <p>See summary of registrations per event</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecomHub;
