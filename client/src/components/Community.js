import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Community.css';

const Community = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: "Best study spots on campus?",
      author: "Sarah M.",
      replies: 12,
      views: 245
    },
    {
      id: 2,
      title: "Looking for study group for DSA",
      author: "John D.",
      replies: 8,
      views: 156
    },
    {
      id: 3,
      title: "Any internship opportunities?",
      author: "Priya S.",
      replies: 5,
      views: 89
    }
  ]);

  const [lostFound, setLostFound] = useState([
    {
      id: 1,
      type: 'lost',
      title: "Lost: Blue Backpack",
      description: "Lost near the library on Monday. Has laptop stickers.",
      author: "Alex K.",
      date: "2 days ago"
    },
    {
      id: 2,
      type: 'found',
      title: "Found: ID Card",
      description: "Found near cafeteria. Owner's name on card.",
      author: "Emma T.",
      date: "1 day ago"
    },
    {
      id: 3,
      type: 'lost',
      title: "Lost: Silver Watch",
      description: "Lost in the main building. Sentimental value.",
      author: "Mike L.",
      date: "3 days ago"
    }
  ]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="community-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/dashboard')}>
          WHAT'SUPTKM
        </div>
        <div className="nav-title">Community</div>
        <div className="user-menu" onClick={handleLogout}>
          <span className="username-display">Logout</span>
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
              <button className="create-btn">+ Start Discussion</button>
            </div>

            <div className="posts-list">
              {discussions.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <h3>{post.title}</h3>
                    <span className="post-author">by {post.author}</span>
                  </div>
                  <div className="post-stats">
                    <span className="stat">💬 {post.replies} replies</span>
                    <span className="stat">👁 {post.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lost & Found Section */}
        {activeTab === 'lostfound' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Lost & Found</h2>
              <button className="create-btn">+ Post Item</button>
            </div>

            <div className="lostfound-list">
              {lostFound.map((item) => (
                <div key={item.id} className={`lostfound-card ${item.type}`}>
                  <div className="item-badge">
                    {item.type === 'lost' ? '🚨 LOST' : '✅ FOUND'}
                  </div>
                  <div className="item-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="item-meta">
                      <span className="item-author">Posted by {item.author}</span>
                      <span className="item-date">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;