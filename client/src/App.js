import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EventRegistration from './components/EventRegistration';
import Community from './components/Community';
import Login from './components/Login';
import Signup from './components/Signup';
import VerifyOtp from './components/VerifyOtp';
import MyEvents from './components/MyEvents';
import Participation from './components/Participation';
import Profile from './components/Profile';
import ExecomHub from './components/ExecomHub';
import EventManagement from './components/EventManagement';
import LiveEvents from './components/LiveEvents';
import ClubStats from './components/ClubStats';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/community" element={<Community />} />
        <Route path="/participation" element={<Participation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/execomhub" element={<ExecomHub />} />
        <Route path="/eventmanagement" element={<EventManagement />} />
        <Route path="/liveevents" element={<LiveEvents />} />
        <Route path="/myevents" element={<MyEvents />} />
        <Route path="/clubstats" element={<ClubStats />} />
        <Route
          path="/event/:eventId/register"
          element={<EventRegistration />}
        />
        <Route path="/event/:eventId" element={<EventRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;