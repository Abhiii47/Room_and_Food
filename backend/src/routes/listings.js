// routes/listings.js
const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { requireAuth, requireProvider } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Resolve upload directory relative to backend root, not src folder
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

// public: get all listings (with basic filters) - NO AUTH REQUIRED
router.get('/', async (req, res) => {
  try {
    const q = { published: true }; // Only show published listings by default
    if (req.query.type) q.type = req.query.type;
    if (req.query.published !== undefined) q.published = req.query.published === 'true';

    // If coordinates are provided, perform geospatial filtering
    const { lat, lng, radius } = req.query;

    // Fetch all matching basic criteria (type, published)
    let list = await Listing.find(q).sort({ createdAt: -1 }).limit(500); // Increase limit for client-side filtering

    if (lat && lng) {
      const targetLat = parseFloat(lat);
      const targetLng = parseFloat(lng);
      const searchRadius = radius ? parseFloat(radius) : 20; // Default 20km radius

      if (!isNaN(targetLat) && !isNaN(targetLng)) {
        // Filter and sort by distance using Haversine formula
        list = list.map(item => {
          if (!item.lat || !item.lng) return { ...item.toObject(), distance: Infinity };

          const R = 6371; // Earth radius in km
          const dLat = (item.lat - targetLat) * Math.PI / 180;
          const dLng = (item.lng - targetLng) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(targetLat * Math.PI / 180) * Math.cos(item.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return { ...item.toObject(), distance };
        })
          .filter(item => item.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance);
      }
    }

    res.json(list);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// provider-only listings
router.get('/provider', requireAuth, requireProvider, async (req, res) => {
  try {
    const list = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// create listing (provider only)
router.post('/', requireAuth, requireProvider, upload.array('images', 6), async (req, res) => {
  try {
    const body = req.body;
    if (!body.title) return res.status(400).json({ message: 'Title is required' });

    const imageFiles = (req.files || []).map(f => `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(f.path)}`);
    const doc = new Listing({
      title: body.title,
      description: body.description,
      address: body.address,
      price: body.price ? Number(body.price) : undefined,
      images: imageFiles,
      imageUrl: imageFiles[0] || body.imageUrl,
      owner: req.user._id,
      hostName: req.user.name,
      lat: body.lat ? Number(body.lat) : undefined,
      lng: body.lng ? Number(body.lng) : undefined,
      type: body.type || body.category || 'room',
      tags: (body.tags && typeof body.tags === 'string' ? body.tags.split(',') : (Array.isArray(body.tags) ? body.tags : [])).map(t => t.trim()).filter(t => t),
      amenities: (body.amenities && typeof body.amenities === 'string' ? body.amenities.split(',') : (Array.isArray(body.amenities) ? body.amenities : [])).map(a => a.trim()).filter(a => a)
    });
    await doc.save();
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// get by id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Listing.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// update (provider owner or admin)
router.put('/:id', requireAuth, requireProvider, upload.array('images', 6), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (!listing.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
    const imageFiles = (req.files || []).map(f => `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(f.path)}`);

    // Update fields
    if (req.body.title) listing.title = req.body.title;
    if (req.body.description !== undefined) listing.description = req.body.description;
    if (req.body.address !== undefined) listing.address = req.body.address;
    if (req.body.price !== undefined) listing.price = req.body.price ? Number(req.body.price) : undefined;
    if (req.body.type !== undefined) listing.type = req.body.type;
    if (req.body.lat !== undefined) listing.lat = req.body.lat ? Number(req.body.lat) : undefined;
    if (req.body.lng !== undefined) listing.lng = req.body.lng ? Number(req.body.lng) : undefined;

    // Handle tags and amenities
    if (req.body.tags !== undefined) {
      listing.tags = (typeof req.body.tags === 'string' ? req.body.tags.split(',') : (Array.isArray(req.body.tags) ? req.body.tags : [])).map(t => t.trim()).filter(t => t);
    }
    if (req.body.amenities !== undefined) {
      listing.amenities = (typeof req.body.amenities === 'string' ? req.body.amenities.split(',') : (Array.isArray(req.body.amenities) ? req.body.amenities : [])).map(a => a.trim()).filter(a => a);
    }

    // Add new images
    if (imageFiles.length) {
      listing.images = (listing.images || []).concat(imageFiles);
      if (!listing.imageUrl) listing.imageUrl = imageFiles[0];
    }

    await listing.save();
    res.json(listing);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// delete
router.delete('/:id', requireAuth, requireProvider, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (!listing.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

