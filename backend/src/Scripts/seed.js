const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
require('dotenv').config({ path: '../../.env' }); // Adjust path if needed

// Hardcode a fallback URI if .env not reachable
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/roomfoodfinder";

const seed = async () => {
  try {
    console.log('Connecting to Mongo:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    // 1. Create a Vendor
    let vendor = await User.findOne({ email: 'seed_vendor@example.com' });
    if (!vendor) {
      vendor = new User({
        name: 'Seed Vendor',
        email: 'seed_vendor@example.com',
        passwordHash: 'password', // Note: In real app this should be hashed, but User model might hook 'pre save'. Assuming pre-save hash.
        userType: 'vendor',
        phone: '1234567890'
      });
      // If the User model hashes password in pre('save'), we just set plain text here.
      // If it doesn't, this will be insecure but fine for localhost testing.
      await vendor.save();
      console.log('Vendor created.');
    } else {
      console.log('Vendor already exists.');
    }

    // 2. Create a Listing
    const listing = new Listing({
      title: 'Modern Single Room near Campus',
      description: 'A beautiful, fully furnished single room with attached bath. 5 mins walk from university main gate.',
      address: '123 University Road, Tech City',
      price: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1522771753033-d47455c69786?auto=format&fit=crop&w=800&q=80',
      owner: vendor._id,
      hostName: vendor.name,
      lat: 28.6139,
      lng: 77.2090,
      type: 'room',
      amenities: ['WiFi', 'AC', 'Geyser', 'Security'],
      tags: ['single', 'furnished', 'student-friendly'],
      published: true
    });

    await listing.save();
    console.log('Listing created.');

    mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed:', err);
    mongoose.disconnect();
  }
};

seed();
