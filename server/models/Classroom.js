const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  department: { type: String, required: true, enum: ['CS', 'EC', 'ME', 'CE', 'EEE', 'ARCH'] },
  capacity: { type: Number },
  // bookings store event reference and requested slot
  bookings: [{
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    date: { type: String },
    timeSlot: { type: String } // e.g., "10:00 AM - 12:00 PM"
  }]
});

// ensure uniqueness on department + roomNumber where practical
ClassroomSchema.index({ department: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Classroom', ClassroomSchema);