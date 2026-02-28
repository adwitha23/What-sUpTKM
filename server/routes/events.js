const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const checkRole = require('../middleware/roleCheck');

// allow file uploads for event images (same pattern used in community.js)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// middleware to authenticate any logged-in user and attach user
const authAny = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Please authenticate' });
  }
};

// student-facing: list events (students only)
router.get('/', authAny, async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// student-facing: get event by id (any authenticated user)
router.get('/:id', authAny, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id)
      .populate('registeredStudents', 'name email');
    if (!ev) return res.status(404).json({ msg: 'Event not found' });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// register current student for an event
router.post('/:id/register', authAny, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ msg: 'Event not found' });

    if (ev.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ msg: 'Already registered' });
    }

    ev.registeredStudents.push(req.user._id);
    await ev.save();

    if (!Array.isArray(req.user.registeredEvents)) req.user.registeredEvents = [];
    req.user.registeredEvents.push(ev._id);
    await req.user.save();

    res.json({ msg: 'Registered' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ---- Organizer/Execom endpoints (require organizer/execom/admin role) ----

// Create event / booking (supports image upload)
router.post('/create', authAny, checkRole(['organizer','execom','admin']), upload.single('image'), async (req, res) => {
  // fields may arrive as strings when multipart/form-data is used
  let {
    title, description,
    date, timeSlot, department, location,
    category, organizer, organizerId, clubCode,
    seats, ticketType, ticketPrice, benefits
  } = req.body;
  try {
    if (typeof seats === 'string') seats = JSON.parse(seats);
  } catch (e) {}
  try {
    if (typeof benefits === 'string') benefits = JSON.parse(benefits);
  } catch (e) {}

  if (!title || !date || !timeSlot || !department || !location || !clubCode) {
    return res.status(400).json({ message: 'Missing required fields: title, date, timeSlot, department, location, clubCode' });
  }

  try {
    const existing = await Event.findOne({ date, timeSlot, location });
    if (existing) {
      return res.status(400).json({ message: `Room ${location} is already booked for ${timeSlot} on ${date}` });
    }

    // build event object, giving priority to uploaded file
    const eventData = {
      title,
      description,
      date,
      timeSlot,
      department,
      location,
      category,
      organizer: organizer || req.user.username,
      organizerId: organizerId || req.user._id,
      clubCode: clubCode,
      seats: seats || { total: 50, available: 50 },
      ticketType: ticketType || 'free',
      ticketPrice: ticketPrice ? Number(ticketPrice) : 0,
      benefits: benefits || {}
    };
    if (req.file) {
      eventData.image = '/uploads/' + req.file.filename;
    } else if (req.body.photo || req.body.image) {
      // allow legacy base64 or url
      eventData.image = req.body.photo || req.body.image;
    }
    const newEvent = new Event(eventData);

    const saved = await newEvent.save();

    // add booking into classroom if exists
    const Classroom = require('../models/Classroom');
    const roomNumber = location.split(' - ')[1];
    if (roomNumber) {
      await Classroom.updateOne(
        { department, roomNumber },
        { $push: { bookings: { date, timeSlot, event: saved._id } } }
      );
    }

    res.status(201).json({ message: 'Event booked successfully', event: saved });
  } catch (err) {
    console.error('events/create error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// get events for a club/organizer
router.get('/club/:clubId', authAny, checkRole(['organizer','execom','admin']), async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const criteria = {
      $or: [
        { organizerId: clubId },
        { organizer: clubId },
        { clubCode: clubId }
      ]
    };
    const events = await Event.find(criteria).populate('registeredStudents', 'username email').sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error('events/club error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// find event by name & clubCode
router.get('/find/:name/:clubCode', authAny, async (req, res) => {
  try {
    const { name, clubCode } = req.params;
    const event = await Event.findOne({ title: name, clubCode }).populate('registeredStudents', 'username email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('events/find error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete event (organizer)
router.delete('/:id', authAny, checkRole(['organizer','execom','admin']), async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    if (new Date(ev.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot delete past event' });
    }
    const deleted = await Event.findByIdAndDelete(req.params.id);
    const [dept, room] = deleted.location ? deleted.location.split(' - ') : [];
    if (dept && room) {
      const Classroom = require('../models/Classroom');
      await Classroom.updateOne({ department: dept, roomNumber: room }, { $pull: { bookings: { event: deleted._id } } });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('events/delete error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// update event (image upload allowed)
router.put('/:id', authAny, checkRole(['organizer','execom','admin']), upload.single('image'), async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    if (new Date(ev.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot modify past event' });
    }
    let updates = { ...req.body };
    if (updates.ticketPrice) updates.ticketPrice = Number(updates.ticketPrice);
    if (updates.seats && typeof updates.seats.total === 'string') {
      updates.seats.total = Number(updates.seats.total);
      updates.seats.available = Number(updates.seats.available || updates.seats.total);
    }
    if (typeof updates.seats === 'string') {
      try { updates.seats = JSON.parse(updates.seats); } catch(e){}
    }
    if (typeof updates.benefits === 'string') {
      try { updates.benefits = JSON.parse(updates.benefits); } catch(e){}
    }
    if (req.file) {
      updates.image = '/uploads/' + req.file.filename;
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('events/update error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;