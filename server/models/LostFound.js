const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emoji: { type: String, required: true },
  _id: false
});

const LostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true, trim: true },
  image: { type: String },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactInfo: { type: String },
  reactions: [ReactionSchema],
  status: { type: String, enum: ['open', 'resolved'], default: 'open' }, // Mark as found/returned
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who marked it resolved
  resolvedAt: { type: Date },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LostFound', LostFoundSchema);