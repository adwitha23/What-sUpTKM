// server/models/User.js
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
  // Fields for Students & Execom
  year: { type: Number },
  branch: { type: String },
  // Specific to Execom/Organizer
  clubCode: { type: String }, 
  execomRole: { type: String },
  // Auth fields
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);