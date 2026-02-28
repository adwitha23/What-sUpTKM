const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  description:{ type: String },
  image:      {
    type: String,
    default: 'https://via.placeholder.com/400x500' // fallback
  },
  // keep date as Date for existing code but also allow a timeSlot string
  date:       { type: Date, required: true },
  time:       { type: String },
  // richer fields added for organizer features
  timeSlot:   { type: String }, // e.g. "10:00 AM - 12:00 PM"
  department: { type: String },
  location:   { type: String },
  category:   { type: String },
  ticketPrice:{ type: Number, default: 0 }, // 0 = free
  maxCapacity:{ type: Number },
  organizer:  { type: String },
  organizerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clubCode:   { type: String },
  seats: {
    total: { type: Number, default: 50 },
    available: { type: Number, default: 50 }
  },
  ticketType: { type: String, enum: ['free','paid'], default: 'free' },
  benefits: {
    freeFood: Boolean,
    dutyLeave: Boolean,
    activityPoints: Boolean,
    certificate: Boolean,
    other: String
  },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Keep a compound index to help unique identification by title + club
EventSchema.index({ title: 1, clubCode: 1 }, { unique: false });

module.exports = mongoose.model('Event', EventSchema);