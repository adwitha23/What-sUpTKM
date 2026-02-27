import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    department: '',
    year: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/events`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const selected = res.data.find(e => e._id === id);
        setEvent(selected);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEvent();
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:5000/api/events/register/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Successfully Registered!");
      navigate('/dashboard');

    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  if (!event) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h2>Register for {event.title}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="text"
          name="department"
          placeholder="Department"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="text"
          name="year"
          placeholder="Year"
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">Confirm Registration</button>
      </form>
    </div>
  );
};

export default EventRegistration;