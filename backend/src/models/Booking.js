// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromDate: Date,
  toDate: Date,
  status: { type: String, enum: ['requested','approved','rejected','cancelled'], default: 'requested' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);

