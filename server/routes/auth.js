const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AccessLog = require('../models/Accesslog');
const RestrictedCountry = require('../models/RestrictedCountry');
const getIPDetails = require('../utils/getIPDetails');
require('dotenv').config({ path: './server/.env' });

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = new User({ username, password, role: role || 'member' });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipDetails = await getIPDetails(ip);
    const country = ipDetails.country_code2 || 'Unknown';

    const restricted = await RestrictedCountry.findOne({ code: country, restricted: true });
    const accessGranted = !restricted;

    await AccessLog.create({
      ipAddress: ip,
      country: country,
      accessGranted: accessGranted,
      timestamp: new Date(),
    });

    if (!accessGranted) {
      return res.status(403).json({ message: 'Access denied from your country' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;