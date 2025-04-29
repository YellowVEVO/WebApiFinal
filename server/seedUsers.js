const mongoose = require('mongoose');
const User = require('./models/User'); // Ensure the correct path and capitalization
require('dotenv').config({ path: './server/.env' });

const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'member1', password: 'password1', role: 'member' },
  { username: 'member2', password: 'password2', role: 'member' }
];

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    await User.deleteMany(); // Clear existing users
    for (const user of users) {
      const newUser = new User(user); // Passwords will be hashed automatically
      await newUser.save();
    }
    console.log('Users seeded');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error seeding users:', err);
    mongoose.disconnect();
  });