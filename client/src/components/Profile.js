import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    year: '',
    branch: ''
  });
  const [originalUsername, setOriginalUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return navigate('/');
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('auth');
        const data = await res.json();
        setUser({
          name: data.name,
          username: data.username,
          email: data.email,
          year: data.year || '',
          branch: data.branch || ''
        });
        setOriginalUsername(data.username);
      } catch (err) {
        console.error(err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, token]);

  useEffect(() => {
    // check availability when username changes and is different from original
    const check = async () => {
      if (!user.username || user.username === originalUsername) {
        setUsernameStatus('');
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/auth/check-username/${user.username}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'Available' : 'Taken');
      } catch (err) {
        setUsernameStatus('Error');
      }
    };
    const timer = setTimeout(check, 500);
    return () => clearTimeout(timer);
  }, [user.username, originalUsername]);

  const handleChange = e => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'save failed');
      alert('Profile updated');
      localStorage.setItem('username', data.username);
      setOriginalUsername(data.username);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/dashboard')}>WHAT'SUPTKM</div>
        <div className="nav-links">
          <button className="community-btn" onClick={() => navigate('/community')}>Community</button>
        </div>
        <div className="user-menu" onClick={() => setShowMenu(!showMenu)}>
          <span className="username-display">{localStorage.getItem('username') || 'User'} ▼</span>
          {showMenu && (
            <div className="dropdown">
              <div className="dropdown-item" onClick={() => navigate('/profile')}>Profile</div>
              <div className="dropdown-item" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</div>
            </div>
          )}
        </div>
      </nav>

      <div className="profile-form">
        <h2>Your Profile</h2>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={user.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input name="username" value={user.username} onChange={handleChange} />
          {usernameStatus && <small className={usernameStatus === 'Available' ? 'available' : 'taken'}>{usernameStatus}</small>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" value={user.email} disabled />
        </div>
        {role === 'student' && (
          <>
            <div className="form-group">
              <label>Year</label>
              <input name="year" value={user.year} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Branch</label>
              <input name="branch" value={user.branch} onChange={handleChange} />
            </div>
          </>
        )}
        <div className="button-row">
          <button className="submit-btn" onClick={handleSave} disabled={saving || usernameStatus==='Taken'}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="submit-btn" style={{background:'#555',marginLeft:'10px'}} disabled={saving} onClick={() => {
              // reset form to original values
              setUser(prev => ({
                ...prev,
                username: originalUsername
              }));
              setUsernameStatus('');
            }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
