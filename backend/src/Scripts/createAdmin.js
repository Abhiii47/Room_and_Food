// Script to create an admin user or promote existing user to admin
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/roomfoodfinder";

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    const args = process.argv.slice(2);
    const email = args[0];
    const password = args[1];

    if (!email || !password) {
      console.log('Usage: node createAdmin.js <email> <password>');
      console.log('Example: node createAdmin.js admin@example.com admin123');
      process.exit(1);
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      await user.save();
      console.log(`✅ User ${email} has been promoted to admin.`);
    } else {
      // Create new admin user
      const hash = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        passwordHash: hash,
        role: 'admin',
        name: 'Admin User'
      });
      console.log(`✅ Admin user created: ${email}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

