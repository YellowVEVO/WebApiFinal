const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Correct file name is 'User.js'
const AccessLog = require('../models/Accesslog');
const RestrictedCountry = require('../models/RestrictedCountry');
const getIPDetails = require('../utils/getIPDetails');
require('dotenv').config({ path: './server/.env' });

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipDetails = await getIPDetails(ip);
    const country = ipDetails.country_code2;

    const restricted = await RestrictedCountry.findOne({ code: country, restricted: true });
    const accessGranted = !restricted;

    await AccessLog.create({ ip, country, accessGranted });

    if (!accessGranted) {
      return res.status(403).json({ message: 'Access denied from your country' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;