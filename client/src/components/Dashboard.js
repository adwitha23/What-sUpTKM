import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || "User";
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 🔐 Auth + Fetch Events
  useEffect(() => {
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5000/api/events',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setEvents(res.data);

      } catch (err) {
        console.error("Error fetching events:", err.response?.data || err.message);
      }
    };

    fetchEvents();
  }, [token, role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 🔥 Swipe Handler
  const swiped = (direction, eventId) => {
    if (direction === 'left') {
      // Remove card
      setEvents((prev) =>
        prev.filter((event) => event._id !== eventId)
      );
    }

    if (direction === 'right') {
      // Navigate to registration form
      navigate(`/event/${eventId}/register`);
    }
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
            onClick={() => navigate('/participation')}
            style={{marginLeft:'10px'}}
          >
            Participation
          </button>
        </div>

        <div
          className="user-menu"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="username-display">
            {username} ▼
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

      <div
        className="tinder-wrapper"
        style={{ flexDirection: 'column' }}
      >
        <div className="card-stack">

          {events.length === 0 && (
            <h2 style={{ textAlign: 'center' }}>
              No more events 🎉
            </h2>
          )}

          {[...events].reverse().map((event) => (
            <TinderCard
              className="swipe"
              key={event._id}
              onSwipe={(dir) =>
                swiped(dir, event._id)
              }
              preventSwipe={['up', 'down']}
              swipeRequirementType="position"
              swipeThreshold={120}
            >
              <div
                className="event-card"
                style={{
                  backgroundImage: `url(${event.image || 'https://via.placeholder.com/400x600'})`
                }}
              >
                <div className="card-info">
                  <h3>{event.title}</h3>
                  <p>{event.organizer}</p>

                  <div className="swipe-instruction">
                    <span>⬅ Skip</span>
                    <span>Register ➡</span>
                  </div>
                </div>
              </div>
            </TinderCard>
          ))}

        </div>

        <div className="swipe-hints">
          <button
            className="hint-btn dislike"
            onClick={() =>
              alert("Swipe left to skip!")
            }
          >
            ✖
          </button>

          <button
            className="hint-btn like"
            onClick={() =>
              alert("Swipe right to register!")
            }
          >
            ✔
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;