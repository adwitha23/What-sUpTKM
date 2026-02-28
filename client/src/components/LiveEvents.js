import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Auth.css';

export default function LiveEvents(){
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        // fetch only events organised by this user
        const userId = localStorage.getItem('userId');
        const res = await API.get(`/events/club/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setEvents(res.data || []);
      }catch(e){ console.error(e); }
    };
    fetch();
  },[]);

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
        <div className="glass-card">
          <h2 style={{ marginTop: 0 }}>Live Events</h2>
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
                <tr key={ev._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td>{ev.title}</td>
                  <td>{ev.date}</td>
                  <td>{ev.location}</td>
                  <td>{(ev.registeredStudents||[]).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button className="submit-btn" onClick={() => navigate('/execomhub')}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
