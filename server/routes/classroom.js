const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const Event = require('../models/Event');

// helper: determine overlap between two slots
const timeSlotOverlap = (slot1, slot2) => {
  const parseTime = (t) => {
    const [time, period] = t.trim().split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const [s1, e1] = slot1.split(' - ').map(parseTime);
  const [s2, e2] = slot2.split(' - ').map(parseTime);
  return s1 < e2 && s2 < e1;
};

// GET /api/classrooms/check?dept=...&date=...&timeSlot=...
router.get('/check', async (req, res) => {
  const { dept, date, timeSlot } = req.query;
  if (!dept || !date || !timeSlot) {
    return res.status(400).json({ message: 'dept, date and timeSlot are required' });
  }

  try {
    const rooms = await Classroom.find({ department: dept }).lean();
    const eventsForDate = await Event.find({ department: dept, date }).lean();
    const booked = new Set();

    eventsForDate.forEach(ev => {
      if (ev.timeSlot && timeSlotOverlap(timeSlot, ev.timeSlot)) {
        // location expected to be like "DEPT - 101"
        const parts = (ev.location || '').split(' - ');
        if (parts[1]) booked.add(parts[1]);
      }
    });

    const payload = rooms.map(r => ({
      roomNumber: r.roomNumber,
      isAvailable: !booked.has(r.roomNumber)
    }));

    res.json(payload);
  } catch (err) {
    console.error('classroom/check error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
