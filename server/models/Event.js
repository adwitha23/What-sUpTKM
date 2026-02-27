const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  description:{ type: String },
  image:      {
    type: String,
    default: 'https://via.placeholder.com/400x500' // fallback
  },
  date:       { type: Date, required: true },
  time:       { type: String },
  location:   { type: String },
  category:   { type: String },
  ticketPrice:{ type: Number, default: 0 }, // 0 = free
  maxCapacity:{ type: Number },
  organizer:  { type: String },
  organizerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);