// scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');

(async ()=> {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Listing.deleteMany({});

  const pass = await bcrypt.hash('password',10);
  const provider = await User.create({ name:'Provider Priya', email:'provider@example.com', passwordHash: pass, role:'provider' });
  const user = await User.create({ name:'User Amit', email:'user@example.com', passwordHash: pass, role:'user' });

  await Listing.create([
    { title:'Cozy room near college', price:4500, address:'Vile Parle, Mumbai', owner: provider._id, hostName: provider.name, type:'room', images: [] },
    { title:'Mess / Tiffin service', price:2200, address:'Powai, Mumbai', owner: provider._id, hostName: provider.name, type:'food', images: [] }
  ]);

  console.log('Seed done');
  process.exit(0);
})();
