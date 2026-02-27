// server/routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper Middleware to verify token and role
const authStudent = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'student') {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ msg: "Please authenticate as a student." });
  }
};

// 1. GET all events for the Tinder Swipe
router.get('/', authStudent, async (req, res) => {
  try {
    // Logic: Only show events the student hasn't registered for yet
    const events = await Event.find({
      registeredStudents: { $nin: [req.user._id] }
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// 2. POST Register for an event (Swipe Right)
router.post('/register/:id', authStudent, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    // Check if already registered
    if (event.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ msg: "Already registered" });
    }

    // Add student to event and event to student profile
    event.registeredStudents.push(req.user._id);
    req.user.registeredEvents.push(event._id);

    await event.save();
    await req.user.save();

    res.json({ msg: "Successfully registered for event!" });
  } catch (err) {
    res.status(500).json({ msg: "Registration failed" });
  }
});

module.exports = router;