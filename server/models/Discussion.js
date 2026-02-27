const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ReactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emoji: { type: String, required: true }, // e.g., "👍", "❤️", "😂"
  _id: false
});

const DiscussionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  image: { type: String },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  replies: [ReplySchema],
  reactions: [ReactionSchema], // Array of emoji reactions
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Discussion', DiscussionSchema);