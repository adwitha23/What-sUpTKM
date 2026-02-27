const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const LostFound = require('../models/LostFound');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT middleware
const authStudent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    if (user.role !== 'student') return res.status(403).json({ msg: 'Forbidden' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Please authenticate' });
  }
};

/* ========== DISCUSSIONS ========== */

// List all discussions with populated data
router.get('/discussions', authStudent, async (req, res) => {
  try {
    const list = await Discussion.find()
      .populate('author', 'name username _id')
      .populate('replies.user', 'name username _id')
      .populate('reactions.user', 'name username _id')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single discussion (also increment view count)
router.get('/discussions/:id', authStudent, async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id)
      .populate('author', 'name username _id')
      .populate('replies.user', 'name username _id')
      .populate('reactions.user', 'name username _id');
    if (!post) return res.status(404).json({ msg: 'Not found' });
    // bump views (non-atomic but OK for this app)
    post.views = (post.views || 0) + 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create discussion (supports optional image upload)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/discussions', authStudent, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;
    const post = new Discussion({ title, body, author: req.user._id });
    if (req.file) {
      post.image = '/uploads/' + req.file.filename;
    }
    await post.save();
    await post.populate('author', 'name username _id');
    if (!Array.isArray(req.user.discussionsPosted)) req.user.discussionsPosted = [];
    req.user.discussionsPosted.push(post._id);
    await req.user.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reply to discussion
router.post('/discussions/:id/reply', authStudent, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Not found' });
    
    post.replies.push({ user: req.user._id, text });
    await post.save();
    await post.populate('replies.user', 'name username _id');
    await post.populate('author', 'name username _id');
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add/remove emoji reaction to discussion
router.post('/discussions/:id/react', authStudent, async (req, res) => {
  try {
    const { emoji } = req.body;
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Not found' });

    // Check if user already reacted with this emoji
    const existingReaction = post.reactions.find(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      post.reactions = post.reactions.filter(
        r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
      );
    } else {
      // Add reaction
      post.reactions.push({ user: req.user._id, emoji });
    }

    await post.save();
    await post.populate('reactions.user', 'name username _id');
    await post.populate('author', 'name username _id');
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ========== LOST & FOUND ========== */

// List all lost & found items
router.get('/lostfound', authStudent, async (req, res) => {
  try {
    const list = await LostFound.find()
      .populate('author', 'name username _id')
      .populate('reactions.user', 'name username _id')
      .populate('resolvedBy', 'name username _id')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single lost & found item
router.get('/lostfound/:id', authStudent, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate('author', 'name username _id')
      .populate('reactions.user', 'name username _id')
      .populate('resolvedBy', 'name username _id');
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create lost & found post (supports optional image upload)
router.post('/lostfound', authStudent, upload.single('image'), async (req, res) => {
  try {
    const { type, title, description, contactInfo } = req.body;
    const item = new LostFound({
      type,
      title,
      description,
      contactInfo,
      author: req.user._id
    });
    if (req.file) {
      item.image = '/uploads/' + req.file.filename;
    }
    await item.save();
    await item.populate('author', 'name username _id');
    // Defensive init in case field is missing on older user documents
    if (!Array.isArray(req.user.lostFoundPosts)) req.user.lostFoundPosts = [];
    req.user.lostFoundPosts.push(item._id);
    await req.user.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add/remove emoji reaction to lost & found
router.post('/lostfound/:id/react', authStudent, async (req, res) => {
  try {
    const { emoji } = req.body;
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Not found' });

    const existingReaction = item.reactions.find(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      item.reactions = item.reactions.filter(
        r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
      );
    } else {
      item.reactions.push({ user: req.user._id, emoji });
    }

    await item.save();
    await item.populate('reactions.user', 'name username _id');
    await item.populate('author', 'name username _id');
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark lost & found as resolved (only author can do this)
router.post('/lostfound/:id/resolve', authStudent, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Not found' });

    if (item.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Only author can mark as resolved' });
    }

    item.status = 'resolved';
    item.resolvedBy = req.user._id;
    item.resolvedAt = Date.now();

    await item.save();
    await item.populate('author', 'name username _id');
    await item.populate('resolvedBy', 'name username _id');
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;