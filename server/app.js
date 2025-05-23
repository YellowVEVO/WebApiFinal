require('dotenv').config({ path: './server/.env' });
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const booksRoutes = require('./routes/books');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Replace '*' with your frontend URL for better security

console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', booksRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'client')));

// Example: Serve login.js
app.get('/login.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'client', 'login.js'));
});

app.listen(5000, () => console.log('Server running on port 3000'));