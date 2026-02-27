import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventRegistration.css';

export default function EventRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      if (res.ok) navigate('/dashboard');
      else throw new Error('Registration failed');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!event || !user) return <div className="error">Data not available</div>;

  return (
    <div className="registration-container">
      <div className="registration-poster">
        <img
          src={event.image || 'https://via.placeholder.com/400x500'}
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

        <div className="ticket-info">
          <div className="ticket-price">
            <span>Ticket Price:</span>
            <p className="price">
              {event.ticketPrice === 0 ? 'FREE' : `₹${event.ticketPrice}`}
            </p>
          </div>
        </div>

        <button className="proceed-btn" onClick={handleRegister}>
          Proceed to Register
        </button>
      </div>
    </div>
  );
}