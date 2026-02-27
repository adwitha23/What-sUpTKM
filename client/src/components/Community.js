import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Community.css';

const Community = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([]);
  const [lostFound, setLostFound] = useState([]);

  // creation + detail states
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', body: '', image: null });
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [showLostForm, setShowLostForm] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'lost', title: '', description: '', contactInfo: '', image: null });
  const [selectedItem, setSelectedItem] = useState(null);


  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // fetch lists when component mounts
  useEffect(() => {
    const fetchLists = async () => {
      if (!token) return navigate('/login');
      try {
        const [dRes, lRes] = await Promise.all([
          fetch('http://localhost:5000/api/community/discussions', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/community/lostfound', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!dRes.ok || !lRes.ok) throw new Error('fetch failed');
        const dData = await dRes.json();
        const lData = await lRes.json();
        setDiscussions(dData);
        setLostFound(lData);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };
    fetchLists();
  }, [navigate, token]);

  // helpers for selecting
  const currentUserId = localStorage.getItem('userId');

  const openDiscussion = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/community/discussions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      setSelectedDiscussion(data);
      // update list copy if we already have that post
      setDiscussions(prev => prev.map(p => (p._id === data._id ? { ...p, views: data.views } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const openLostItem = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/community/lostfound/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      setSelectedItem(data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeDetail = () => {
    setSelectedDiscussion(null);
    setSelectedItem(null);
    setReplyText('');
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('title', newDiscussion.title);
      form.append('body', newDiscussion.body);
      if (newDiscussion.image) form.append('image', newDiscussion.image);

      const res = await fetch('http://localhost:5000/api/community/discussions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'create failed');
      setDiscussions(prev => [data, ...prev]);
      setNewDiscussion({ title: '', body: '', image: null });
      setShowDiscussionForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not create discussion');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedDiscussion) return;
    try {
      const res = await fetch(`http://localhost:5000/api/community/discussions/${selectedDiscussion._id}/reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText })
      });
      if (!res.ok) throw new Error('reply failed');
      const updated = await res.json();
      setSelectedDiscussion(updated);
      setDiscussions(prev => prev.map(p => (p._id === updated._id ? updated : p)));
      setReplyText('');
    } catch (err) {
      console.error(err);
      alert('Reply failed');
    }
  };

  const handleReact = async (emoji, type = 'discussion') => {
    if (type === 'discussion' && selectedDiscussion) {
      try {
        const res = await fetch(`http://localhost:5000/api/community/discussions/${selectedDiscussion._id}/react`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji })
        });
        if (!res.ok) throw new Error('react failed');
        const updated = await res.json();
        setSelectedDiscussion(updated);
        setDiscussions(prev => prev.map(p => (p._id === updated._id ? updated : p)));
      } catch (err) {
        console.error(err);
      }
    } else if (type === 'lost' && selectedItem) {
      try {
        const res = await fetch(`http://localhost:5000/api/community/lostfound/${selectedItem._id}/react`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji })
        });
        if (!res.ok) throw new Error('react failed');
        const updated = await res.json();
        setSelectedItem(updated);
        setLostFound(prev => prev.map(i => (i._id === updated._id ? updated : i)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateLost = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('type', newItem.type);
      form.append('title', newItem.title);
      form.append('description', newItem.description);
      form.append('contactInfo', newItem.contactInfo || '');
      if (newItem.image) form.append('image', newItem.image);

      const res = await fetch('http://localhost:5000/api/community/lostfound', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'create failed');
      setLostFound(prev => [data, ...prev]);
      setNewItem({ type: 'lost', title: '', description: '', contactInfo: '', image: null });
      setShowLostForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not post item');
    }
  };

  const handleResolve = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`http://localhost:5000/api/community/lostfound/${selectedItem._id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'resolve failed');
      setSelectedItem(data);
      setLostFound(prev => prev.map(i => (i._id === data._id ? data : i)));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not update item');
    }
  };

  return (
    <div className="community-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/dashboard')}>
          WHAT'SUPTKM
        </div>
        <div className="nav-title">Community</div>
        <div className="user-menu">
          <span className="username-display">{localStorage.getItem('username') || 'User'}</span>
          <span className="auth-link" style={{marginLeft:'10px'}} onClick={handleLogout}>Logout</span>
        </div>
      </nav>

      {/* Community Content */}
      <div className="community-content">
        <div className="community-header">
          <h1>Campus Community</h1>
          <p>Connect, share and help each other</p>
        </div>

        {/* Tab Buttons */}
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussions')}
          >
            💬 Discussions
          </button>
          <button
            className={`tab-btn ${activeTab === 'lostfound' ? 'active' : ''}`}
            onClick={() => setActiveTab('lostfound')}
          >
            🔍 Lost & Found
          </button>
        </div>

        {/* Discussions Section */}
        {activeTab === 'discussions' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Discussions</h2>
              <button className="create-btn" onClick={() => setShowDiscussionForm(true)}>+ Start Discussion</button>
            </div>

            {showDiscussionForm && (
              <form className="create-form" onSubmit={handleCreateDiscussion}>
                <input
                  placeholder="Title"
                  value={newDiscussion.title}
                  onChange={e => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Body"
                  value={newDiscussion.body}
                  onChange={e => setNewDiscussion({ ...newDiscussion, body: e.target.value })}
                  rows={4}
                  required
                />
                <input type="file" accept="image/*" onChange={e => setNewDiscussion({ ...newDiscussion, image: e.target.files[0] })} />
                <button type="submit" className="submit-btn">Post</button>
                <button type="button" className="submit-btn" onClick={() => setShowDiscussionForm(false)} style={{background:'#555',marginLeft:'10px'}}>Cancel</button>
              </form>
            )}

            <div className="posts-list">
              {discussions.map((post) => (
                <div key={post._id} className="post-card" onClick={() => openDiscussion(post._id)}>
                      {post.image && (
                        <div className="post-thumb">
                          <img src={`http://localhost:5000${post.image}`} alt="post" />
                        </div>
                      )}
                      <div className="post-header">
                        <h3>{post.title}</h3>
                        <span className="post-author">by {post.author?.username || post.author?.name}</span>
                      </div>
                  <div className="post-stats">
                    <span className="stat">💬 {post.replies?.length || 0} replies</span>
                    <span className="stat">👁 {post.views || 0} views</span>
                  </div>
                </div>
              ))}
            </div>

            {/* detail modal for discussion */}
            {selectedDiscussion && (
              <div className="modal" onClick={closeDetail}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <button className="close-btn" onClick={closeDetail}>×</button>
                  <h3>{selectedDiscussion.title}</h3>
                  {selectedDiscussion.image && <img className="modal-image" src={`http://localhost:5000${selectedDiscussion.image}`} alt="discussion" />}
                  <p>{selectedDiscussion.body}</p>
                  <small>by {selectedDiscussion.author?.username || selectedDiscussion.author?.name}</small>

                  <div className="reactions">
                    {['👍','❤️','😂','😮','😢','👏'].map(e => {
                      const count = selectedDiscussion.reactions?.filter(r => r.emoji === e).length || 0;
                      const reacted = selectedDiscussion.reactions?.some(r => r.emoji === e && r.user?._id === currentUserId);
                      return (
                        <button
                          key={e}
                          onClick={() => handleReact(e)}
                          className={reacted ? 'active-emoji' : ''}
                        >
                          {e} {count > 0 ? count : ''}
                        </button>
                      );
                    })}
                  </div>

                  <div className="replies">
                    <h4>Replies</h4>
                    {selectedDiscussion.replies?.map(r => (
                      <div key={r._id} className="reply">
                        <strong>{r.user?.username || r.user?.name}</strong>: {r.text}
                      </div>
                    ))}
                    <div className="reply-form">
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                      />
                      <button onClick={handleReply}>Send</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lost & Found Section */}
        {activeTab === 'lostfound' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Lost & Found</h2>
              <button className="create-btn" onClick={() => setShowLostForm(true)}>+ Post Item</button>
            </div>

            {showLostForm && (
              <form className="create-form" onSubmit={handleCreateLost}>
                <select
                  value={newItem.type}
                  onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
                <input
                  placeholder="Title"
                  value={newItem.title}
                  onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                  required
                />
                <input
                  placeholder="Contact info (optional)"
                  value={newItem.contactInfo}
                  onChange={e => setNewItem({ ...newItem, contactInfo: e.target.value })}
                />
                <input type="file" accept="image/*" onChange={e => setNewItem({ ...newItem, image: e.target.files[0] })} />
                <button type="submit" className="submit-btn">Post</button>
                <button type="button" className="submit-btn" onClick={() => setShowLostForm(false)} style={{background:'#555',marginLeft:'10px'}}>Cancel</button>
              </form>
            )}

            <div className="lostfound-list">
              {lostFound.map((item) => (
                <div
                  key={item._id}
                  className={`lostfound-card ${item.type}`}
                  onClick={() => openLostItem(item._id)}
                >
                  <div className="item-badge">
                    {item.type === 'lost' ? '🚨 LOST' : '✅ FOUND'}
                    {item.status === 'resolved' && <span className="resolved-badge">RESOLVED</span>}
                  </div>
                  <div className="item-content">
                    <h3>{item.title}</h3>
                    {item.image && <img className="item-image" src={`http://localhost:5000${item.image}`} alt="item" />}
                    <p>{item.description}</p>
                    <div className="item-meta">
                      <span className="item-author">Posted by {item.author?.username || item.author?.name}</span>
                      <span className="item-date">{new Date(item.createdAt || item.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedItem && (
              <div className="modal" onClick={closeDetail}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <button className="close-btn" onClick={closeDetail}>×</button>
                  <h3>{selectedItem.title}</h3>
                  {selectedItem.image && <img className="modal-image" src={`http://localhost:5000${selectedItem.image}`} alt="item" />}
                  <p>{selectedItem.description}</p>
                  <small>by {selectedItem.author?.username || selectedItem.author?.name}</small>
                  <div className="reactions">
                    {['👍','❤️','😂','😮','😢','👏'].map(e => (
                      <button key={e} onClick={() => handleReact(e,'lost')}>{e}</button>
                    ))}
                  </div>
                  <div className="existing-reactions">
                    {selectedItem.reactions?.map(r => (
                      <span key={r._id}>{r.emoji}</span>
                    ))}
                  </div>
                  {selectedItem.contactInfo && (
                    <p>Contact: {selectedItem.contactInfo}</p>
                  )}
                  {selectedItem.status === 'open' && selectedItem.author?._id === currentUserId && (
                    <button className="submit-btn" onClick={handleResolve} style={{marginTop:'15px'}}>Mark as Found</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;