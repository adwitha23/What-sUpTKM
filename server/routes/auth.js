// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// 1️⃣ Check Username Availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username.toLowerCase()
    });

    res.json({ available: !user });

  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});


// 2️⃣ Register User & Send OTP
router.post('/register', async (req, res) => {
  try {
    const { username, email, name, role, year, branch, clubCode, execomRole } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }]
    });

    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      username: username.toLowerCase(),
      email,
      name,
      role,
      year,
      branch,
      clubCode,
      execomRole,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false
    });

    await newUser.save();
    await sendEmail(email, otp);

    res.status(200).json({ msg: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Registration failed" });
  }
});


// 3️⃣ Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, clubCode: user.clubCode },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      msg: "Verified successfully!",
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Verification failed" });
  }
});


// 4️⃣ Login Request (Send OTP)
router.post('/login-request', async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await User.findOne({
      username: username.toLowerCase(),
      email
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();
    await sendEmail(email, otp);

    res.status(200).json({ msg: "Login OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Login failed" });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-otp -otpExpires -__v');
    
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    
    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: 'Please authenticate' });
  }
});

module.exports = router;