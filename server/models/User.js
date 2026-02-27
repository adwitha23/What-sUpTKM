// filepath: server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 4 },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'organizer', 'execom', 'admin'], 
    required: true 
  },
  year: { type: Number },
  branch: { type: String },
  clubCode: { type: String }, 
  execomRole: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);