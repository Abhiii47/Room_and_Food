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
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage });

// public: get all listings (with basic filters)
router.get('/', async (req,res) => {
  try {
    const q = {};
    if (req.query.type) q.type = req.query.type;
    if (req.query.published) q.published = req.query.published === 'true';
    const list = await Listing.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// provider-only listings
router.get('/provider', requireAuth, requireProvider, async (req,res) => {
  try {
    const list = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// create listing (provider only)
router.post('/', requireAuth, requireProvider, upload.array('images', 6), async (req,res) => {
  try {
    const body = req.body;
    if (!body.title) return res.status(400).json({ message: 'Title is required' });
    if (!body.lat || !body.lng) return res.status(400).json({ message: 'Latitude and longitude are required' });
    
    const imageFiles = (req.files || []).map(f => `${process.env.BASE_URL || ''}/uploads/${path.basename(f.path)}`);
    const doc = new Listing({
      title: body.title,
      description: body.description,
      address: body.address,
      price: body.price ? Number(body.price) : undefined,
      images: imageFiles,
      imageUrl: imageFiles[0] || body.imageUrl,
      owner: req.user._id,
      hostName: req.user.name,
      lat: Number(body.lat),
      lng: Number(body.lng),
      type: body.type || body.category || 'room',
      tags: (body.tags && body.tags.split?.(',')) || [],
      amenities: (body.amenities && body.amenities.split?.(',')) || []
    });
    await doc.save();
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// get by id
router.get('/:id', async (req,res) => {
  try {
    const doc = await Listing.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// update (provider owner or admin)
router.put('/:id', requireAuth, requireProvider, upload.array('images', 6), async (req,res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (!listing.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
    const imageFiles = (req.files || []).map(f => `${process.env.BASE_URL || ''}/uploads/${path.basename(f.path)}`);
    Object.assign(listing, { ...req.body });
    if (imageFiles.length) listing.images = (listing.images || []).concat(imageFiles);
    await listing.save();
    res.json(listing);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// delete
router.delete('/:id', requireAuth, requireProvider, async (req,res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (!listing.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

