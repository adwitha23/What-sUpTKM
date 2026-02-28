// client/src/components/VerifyOtp.js
import React, { useState } from 'react';
import API from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;
  const isLoginFlow = location.state?.isLoginFlow; 

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { email, otp });
      
      alert(res.data.msg);

      if (isLoginFlow) {
        // --- SAVING DATA FOR ROLE-BASED ACCESS ---
        localStorage.setItem('token', res.data.token);
        // store full user object for organizer components
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('username', res.data.user.username);
          localStorage.setItem('role', res.data.user.role);
          if (res.data.user.id || res.data.user._id) {
            localStorage.setItem('userId', res.data.user.id || res.data.user._id);
          }
        }
        
        // --- REDIRECTION LOGIC ---
        if (res.data.user.role === 'student') {
          navigate('/home');
        } else {
          // send organizers to Execom hub
          navigate('/execomhub');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid or Expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <h2>Verify Identity</h2>
          <p>We've sent a 6-digit code to <br/> 
            <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="input-group" style={{ marginTop: '30px' }}>
            <input 
              type="text" 
              className="glass-input"
              placeholder="0 0 0 0 0 0" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              maxLength="6"
              required 
              style={{ 
                fontSize: '2rem', 
                textAlign: 'center', 
                letterSpacing: '12px',
                fontWeight: 'bold',
                color: '#f472b6'
              }}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading || otp.length < 6}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="auth-footer">
          Didn't receive the code? <br/>
          <span className="auth-link" onClick={() => window.location.reload()}>Resend OTP</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;