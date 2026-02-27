const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// simple JWT middleware
const authStudent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    if (user.role !== 'student') return res.status(403).json({ msg: 'Forbidden' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Please authenticate' });
  }
};

// list all events
router.get('/', authStudent, async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// get one event by id
router.get('/:id', authStudent, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ msg: 'Event not found' });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// register current student for an event
router.post('/:id/register', authStudent, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ msg: 'Event not found' });

    // prevent duplicate
    if (ev.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ msg: 'Already registered' });
    }

    ev.registeredStudents.push(req.user._id);
    await ev.save();

    req.user.registeredEvents.push(ev._id);
    await req.user.save();

    res.json({ msg: 'Registered' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;