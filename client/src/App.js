// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import VerifyOtp from './components/VerifyOtp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EventRegistration from './components/EventRegistration';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route can be login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerifyOtp />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/event/:id/register" element={<EventRegistration />} />
          {/* You can add your Tinder card route here later */}
          {/* <Route path="/home" element={<TinderSwipe />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;