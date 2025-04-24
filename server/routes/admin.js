const express = require('express');
const RestrictedCountry = require('../models/RestrictedCountry');
const verifyToken = require('../utils/verifyToken');

const router = express.Router();

// Add or update restricted country
router.post('/restrict', verifyToken, async (req, res) => {
  const { code, restricted } = req.body;

  try {
    const result = await RestrictedCountry.findOneAndUpdate(
      { code },
      { restricted },
      { upsert: true, new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;