// Added from campus-portal3: EventManagement (lightly trimmed)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

export default function EventManagement(){
  const navigate = useNavigate();
  const location = useLocation();
  const existingEvent = location.state?.event;
  const [form, setForm] = useState({ title: '', description: '', date: '', timeSlot: '', department: '', location: '', clubCode: '', seats: { total: 50, available: 50 }, ticketType: 'free', ticketPrice: 0 });
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
          : `http://localhost:5000${existingEvent.image}`;
        setImagePreview(img);
      }
    }
  }, [existingEvent]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    try{
      const res = await axios.get('http://localhost:5000/api/classrooms/check', { params: { dept: form.department, date: form.date, timeSlot: form.timeSlot } });
      setRooms(res.data || []);
    }catch(e){ console.error(e); alert('Could not fetch rooms'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try{
      const base = { ...form, location: `${form.department} - ${selectedRoom}`, clubCode: form.clubCode };
      let config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      let res;

      if (imageFile) {
        // use FormData for file; convert objects to JSON
        const data = new FormData();
        Object.entries(base).forEach(([k,v])=> {
          if (v && typeof v === 'object') data.append(k, JSON.stringify(v));
          else data.append(k, v);
        });
        data.append('image', imageFile);
        if (existingEvent) {
          res = await axios.put(`http://localhost:5000/api/events/${existingEvent._id}`, data, config);
        } else {
          res = await axios.post('http://localhost:5000/api/events/create', data, config);
        }
      } else {
        // no file selected, send JSON
        if (existingEvent) {
          res = await axios.put(`http://localhost:5000/api/events/${existingEvent._id}`, base, config);
        } else {
          res = await axios.post('http://localhost:5000/api/events/create', base, config);
        }
      }

      alert(existingEvent ? 'Updated' : 'Created');
      navigate('/execomhub');
    }catch(err){ console.error(err); alert(err.response?.data?.message || 'Submission failed'); }
  };

  return (
    <div className="auth-container">
      <div className="glass-card" style={{maxWidth:'650px'}}>
        <h2 style={{marginTop:0}}>{existingEvent? 'Edit Event':'Create Event'}</h2>
        <form onSubmit={submit} style={{display:'grid', gap:16}}>
          <div className="input-group"><input className="glass-input" name="title" value={form.title} onChange={handleChange} placeholder="Title" required /></div>
          <div className="input-group"><textarea className="glass-input" name="description" value={form.description} onChange={handleChange} placeholder="Description" /></div>
          
          {/* Row 1: Date & Time */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="input-group"><input className="glass-input" name="date" type="date" value={form.date} onChange={handleChange} required /></div>
            <div className="input-group"><input className="glass-input" name="timeSlot" value={form.timeSlot} onChange={handleChange} placeholder="10:00 AM - 12:00 PM" required /></div>
          </div>
          
          {/* Row 2: Department & Club Code */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="input-group"><input className="glass-input" name="department" value={form.department} onChange={handleChange} placeholder="Department (CS)" /></div>
            <div className="input-group"><input className="glass-input" name="clubCode" value={form.clubCode} onChange={handleChange} placeholder="Club Code" /></div>
          </div>
          
          {/* Row 3: Check Rooms & Room Select */}
          <div style={{display:'grid', gridTemplateColumns:'2fr 3fr', gap:12, alignItems:'flex-end'}}>
            <button type="button" className="submit-btn" onClick={checkRooms} style={{marginBottom:0, padding:'12px 16px'}}>Check Rooms</button>
            <select className="glass-input" onChange={(e)=>setSelectedRoom(e.target.value)} value={selectedRoom}>
              <option value="">Select Room</option>
              {rooms.map(r=> <option key={r.roomNumber} value={r.roomNumber}>{r.roomNumber} {r.isAvailable? '(Free)':'(Booked)'}</option>)}
            </select>
          </div>
          
          {/* Row 4: Seats, Price, Type */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
            <div className="input-group" style={{marginBottom:0}}>
              <label style={{color:'#a78bfa', fontSize:'0.85rem', marginBottom:'4px', display:'block'}}>Total Seats</label>
              <input className="glass-input" type="number" value={form.seats.total} onChange={(e)=>{
                const v = parseInt(e.target.value) || 0;
                setForm(prev=> ({...prev, seats:{...prev.seats, total:v, available:v}}));
              }} placeholder="50" />
            </div>
            <div className="input-group" style={{marginBottom:0}}>
              <label style={{color:'#a78bfa', fontSize:'0.85rem', marginBottom:'4px', display:'block'}}>Price (₹)</label>
              <input className="glass-input" type="number" value={form.ticketPrice} onChange={handleChange} name="ticketPrice" placeholder="0" />
            </div>
            <div className="input-group" style={{marginBottom:0}}>
              <label style={{color:'#a78bfa', fontSize:'0.85rem', marginBottom:'4px', display:'block'}}>Type</label>
              <select className="glass-input" name="ticketType" value={form.ticketType} onChange={handleChange}>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          
          {/* Image upload */}
          <div className="input-group">
            <label style={{color:'#a78bfa', fontSize:'0.85rem', marginBottom:'8px', display:'block'}}>Event Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleFile} style={{color:'#e2e8f0'}} />
          </div>
          
          {/* Image preview */}
          {imagePreview && (
            <div style={{textAlign:'center'}}>
              <img src={imagePreview} alt="preview" style={{maxWidth:'100%', maxHeight:'200px', borderRadius:'8px'}} />
            </div>
          )}
          
          {/* Buttons */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:10}}>
            <button type="submit" className="submit-btn">{existingEvent? 'Update':'Create'}</button>
            <button type="button" className="submit-btn" onClick={()=>navigate('/execomhub')} style={{background:'#374151'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
