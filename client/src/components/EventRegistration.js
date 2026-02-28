import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './EventRegistration.css';

export default function EventRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAttendees, setShowAttendees] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const evRes = await fetch(
          `http://localhost:5000/api/events/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!evRes.ok) throw new Error('Event fetch failed');
        const evData = await evRes.json();
        setEvent(evData);

        const userRes = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('User fetch failed');
        const userData = await userRes.json();
        setUser(userData);
        // check registration status
        // coerce array of ids if populated object list
        const registeredIds = (evData.registeredStudents || []).map(s =>
          typeof s === 'string' ? s : s._id
        );
        if (registeredIds.includes(userData._id)) {
          setIsRegistered(true);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/events/${eventId}/register`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (res.ok) {
        alert('Successfully registered! ✓');
        navigate('/dashboard');
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!event || !user) return <div className="error">Data not available</div>;

  const attendeeCount = event.registeredStudents
    ? event.registeredStudents.length
    : 0;

  return (
    <div>
      {/* reuse dashboard navbar for consistency */}
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
            style={{ marginLeft: '10px' }}
          >
            Participation
          </button>
        </div>
        <div
          className="user-menu"
          onClick={() => setShowAttendees(false)}
        >
          {/* dummy; we don't need menu here but keep spacing */}
        </div>
      </nav>
    <div className="registration-page-bg">
      <div className="registration-container">
      <div className="registration-poster">
        <img
          src={(event.image && !event.image.startsWith('http') ? `http://localhost:5000${event.image}` : event.image) || 'https://via.placeholder.com/400x500'}
          alt={event.title}
        />
      </div>
      <div className="registration-details">
        <h1>{event.title}</h1>
        <p className="event-description">{event.description}</p>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={user.name || ''}
            disabled
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="input-field"
          />
        </div>

        {attendeeCount >= 0 && (
          <p
            className={
              'attendee-info' + (attendeeCount === 0 ? ' no-click' : '')
            }
            onClick={() => {
              if (attendeeCount > 0) setShowAttendees(true);
            }}
          >
            {attendeeCount === 0
              ? 'No one is attending yet'
              : `${attendeeCount} ${
                  attendeeCount === 1 ? 'person' : 'people'
                } attending`}
          </p>
        )}

        <div className="ticket-info">
          <div className="ticket-price">
            <span>Ticket Price:</span>
            <p className="price">
              {event.ticketPrice === 0 ? 'FREE' : `₹${event.ticketPrice}`}
            </p>
          </div>
        </div>

        {isRegistered ? (
          <button className="proceed-btn" disabled>
            Already Registered
          </button>
        ) : (
          <button className="proceed-btn" onClick={handleRegister}>
            Proceed to Register
          </button>
        )}
      </div>
    </div>

      {showAttendees && (
        <div
          className="attendee-modal"
          onClick={() => setShowAttendees(false)}
        >
          <div
            className="attendee-list"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Attendees</h3>
            <ul>
              {event.registeredStudents.map((s) => (
                <li key={s._id || s}>{s.name || s.email || s}</li>
              ))}
            </ul>
            <button onClick={() => setShowAttendees(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}