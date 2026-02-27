// client/src/components/Signup.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    year: '',
    branch: '',
    clubCode: '',
    execomRole: ''
  });

  const [usernameStatus, setUsernameStatus] = useState(''); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.username.length >= 4) {
        setUsernameStatus('checking');
        try {
          const res = await axios.get(`http://localhost:5000/api/auth/check-username/${formData.username}`);
          setUsernameStatus(res.data.available ? 'available' : 'taken');
        } catch (err) {
          console.error("Check failed");
        }
      } else {
        setUsernameStatus('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus !== 'available') return alert("Please choose a valid username");
    
    setLoading(true); // Start loading
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { ...formData, role });
      
      alert(res.data.msg); // "OTP sent to your email"
      
      // 3. Navigate to the Verify page and pass the email via "state"
      navigate('/verify', { state: { email: formData.email } });
      
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="auth-container">
        <div className="glass-card">
        <div className="auth-header">
            <h2>Join the Portal</h2>
            <p>Connect with your campus community</p>
        </div>
        
        <div className="role-selector">
            <button 
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
            >Student</button>
            <button 
            className={`role-btn ${role === 'execom' ? 'active' : ''}`}
            onClick={() => setRole('execom')}
            >Club Execom</button>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="input-group">
            <input className="glass-input" name="name" placeholder="Full Name" onChange={handleChange} required />
            </div>
            
            <div className="input-group">
            <input className="glass-input" name="email" type="email" placeholder="College Email" onChange={handleChange} required />
            </div>
            
            <div className="input-group">
            <input className="glass-input" name="username" placeholder="Username (min 4 chars)" onChange={handleChange} required />
            <div style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '0.8rem' }}>
                {usernameStatus === 'checking' && <span style={{color: 'orange'}}>⏳</span>}
                {usernameStatus === 'available' && <span style={{color: '#4ade80'}}>✔</span>}
                {usernameStatus === 'taken' && <span style={{color: '#f87171'}}>✖</span>}
            </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
            <input className="glass-input" name="year" placeholder="Year" onChange={handleChange} required />
            <input className="glass-input" name="branch" placeholder="Branch" onChange={handleChange} required />
            </div>

            {role === 'execom' && (
            <div style={{ marginTop: '15px' }}>
                <input className="glass-input" name="clubCode" placeholder="Club ID Code" onChange={handleChange} required style={{marginBottom: '10px'}} />
                <input className="glass-input" name="execomRole" placeholder="Position (e.g. Lead)" onChange={handleChange} required />
            </div>
            )}
            
            <button type="submit" className="submit-btn" disabled={usernameStatus !== 'available' || loading}>
            {loading ? "Processing..." : "Create Account"}
            </button>
        </form>

        <div className="auth-footer">
            Already registered? <span className="auth-link" onClick={() => navigate('/login')}>Login</span>
        </div>
        </div>
    </div>
    );
};

export default Signup;