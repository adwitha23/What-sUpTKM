const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  department: { type: String, required: true, enum: ['CS', 'EC', 'ME', 'CE', 'EEE'] },
  capacity: { type: Number },
  // This stores existing bookings to prevent overlaps
  bookings: [{
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    date: { type: Date },
    timeSlot: { type: String } // e.g., "10:00-12:00"
  }]
});

module.exports = mongoose.model('Classroom', ClassroomSchema);