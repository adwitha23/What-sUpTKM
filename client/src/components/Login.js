// client/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // This route will check credentials and send a fresh OTP
      const res = await axios.post('http://localhost:5000/api/auth/login-request', formData);
      alert(res.data.msg);
      // Move to verify screen, passing email so we can verify the login OTP
      navigate('/verify', { state: { email: formData.email, isLoginFlow: true } });
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
        <div className="glass-card">
        <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your campus account</p>
        </div>

        <form onSubmit={handleLoginRequest}>
            <div className="input-group">
            <input 
                className="glass-input"
                name="username" 
                placeholder="Username" 
                onChange={handleChange} 
                required 
            />
            </div>
            <div className="input-group">
            <input 
                className="glass-input"
                name="email" 
                type="email" 
                placeholder="College Email" 
                onChange={handleChange} 
                required 
            />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Verifying..." : "Send Login OTP"}
            </button>
        </form>

        <div className="auth-footer">
            Don't have an account? <span className="auth-link" onClick={() => navigate('/signup')}>Sign Up</span>
        </div>
        </div>
    </div>
    );
};

export default Login;