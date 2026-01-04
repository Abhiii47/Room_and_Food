// models/Listing.js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  address: String,
  price: Number,
  images: [String],           // store URLs like /uploads/...
  imageUrl: String,           // fallback single image path
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostName: String,
  lat: Number,
  lng: Number,
  type: String,               // 'room' | 'food' | 'both' | free text
  tags: [String],
  amenities: [String],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  published: { type: Boolean, default: true }
});

module.exports = mongoose.model('Listing', listingSchema);

