// server/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: { type: String, required: true }, // Club Name
  image: { type: String, default: 'https://via.placeholder.com/400x600' }, // Placeholder for now
  category: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Workshop'] },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);