import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

export default function EventManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const existingEvent = location.state?.event;

  const API = process.env.REACT_APP_API_URL;

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    timeSlot: '',
    department: '',
    location: '',
    clubCode: '',
    seats: { total: 50, available: 50 },
    ticketType: 'free',
    ticketPrice: 0
  });

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (existingEvent) {
      setForm(prev => ({ ...prev, ...existingEvent }));

      if (existingEvent.image) {
        const img = existingEvent.image.startsWith('http')
          ? existingEvent.image
          : `${API}${existingEvent.image}`;
        setImagePreview(img);
      }
    }
  }, [existingEvent, API]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview('');
    }
  };

  const checkRooms = async () => {
    try {
      const res = await axios.get(`${API}/api/classrooms/check`, {
        params: {
          dept: form.department,
          date: form.date,
          timeSlot: form.timeSlot
        }
      });

      setRooms(res.data || []);
    } catch (e) {
      console.error(e);
      alert('Could not fetch rooms');
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const base = {
        ...form,
        location: `${form.department} - ${selectedRoom}`
      };

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (imageFile) {
        const data = new FormData();

        Object.entries(base).forEach(([k, v]) => {
          if (v && typeof v === 'object')
            data.append(k, JSON.stringify(v));
          else
            data.append(k, v);
        });

        data.append('image', imageFile);

        if (existingEvent) {
          await axios.put(
            `${API}/api/events/${existingEvent._id}`,
            data,
            config
          );
        } else {
          await axios.post(
            `${API}/api/events/create`,
            data,
            config
          );
        }
      } else {
        if (existingEvent) {
          await axios.put(
            `${API}/api/events/${existingEvent._id}`,
            base,
            config
          );
        } else {
          await axios.post(
            `${API}/api/events/create`,
            base,
            config
          );
        }
      }

      alert(existingEvent ? 'Updated' : 'Created');
      navigate('/execomhub');

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card" style={{ maxWidth: '650px' }}>
        <h2 style={{ marginTop: 0 }}>
          {existingEvent ? 'Edit Event' : 'Create Event'}
        </h2>

        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>

          <div className="input-group">
            <input
              className="glass-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              required
            />
          </div>

          <div className="input-group">
            <textarea
              className="glass-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              className="glass-input"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <input
              className="glass-input"
              name="timeSlot"
              value={form.timeSlot}
              onChange={handleChange}
              placeholder="10:00 AM - 12:00 PM"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              className="glass-input"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department (CS)"
            />

            <input
              className="glass-input"
              name="clubCode"
              value={form.clubCode}
              onChange={handleChange}
              placeholder="Club Code"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 12 }}>
            <button type="button" className="submit-btn" onClick={checkRooms}>
              Check Rooms
            </button>

            <select
              className="glass-input"
              onChange={(e) => setSelectedRoom(e.target.value)}
              value={selectedRoom}
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.roomNumber} value={r.roomNumber}>
                  {r.roomNumber} {r.isAvailable ? '(Free)' : '(Booked)'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <input
              className="glass-input"
              type="number"
              value={form.seats.total}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 0;
                setForm(prev => ({
                  ...prev,
                  seats: { ...prev.seats, total: v, available: v }
                }));
              }}
              placeholder="Total Seats"
            />

            <input
              className="glass-input"
              type="number"
              value={form.ticketPrice}
              onChange={handleChange}
              name="ticketPrice"
              placeholder="Price"
            />

            <select
              className="glass-input"
              name="ticketType"
              value={form.ticketType}
              onChange={handleChange}
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <input type="file" accept="image/*" onChange={handleFile} />

          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button type="submit" className="submit-btn">
              {existingEvent ? 'Update' : 'Create'}
            </button>

            <button
              type="button"
              className="submit-btn"
              onClick={() => navigate('/execomhub')}
              style={{ background: '#374151' }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}