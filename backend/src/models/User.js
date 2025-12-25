// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  role: { type: String, enum: ['user','provider','admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// helper
userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
