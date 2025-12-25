// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { requireAuth, requireProvider } = require('../middleware/auth');

// create booking (any authenticated user)
router.post('/', requireAuth, async (req,res) => {
  try {
    const { listingId, fromDate, toDate } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    const book = new Booking({
      listing: listing._id,
      user: req.user._id,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined
    });
    await book.save();
    res.json(book);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// get user's own bookings (authenticated users)
router.get('/user', requireAuth, async (req,res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('listing', 'title address price images imageUrl type')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// provider: list booking requests (provider sees bookings for their listings)
router.get('/requests', requireAuth, requireProvider, async (req,res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).select('_id');
    const listingIds = listings.map(l => l._id);
    const reqs = await Booking.find({ listing: { $in: listingIds } }).populate('user', 'name email').populate('listing', 'title');
    res.json(reqs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// respond to booking (approve/reject) - provider only
router.post('/:id/respond', requireAuth, requireProvider, async (req,res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (!booking.listing.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
    booking.status = req.body.approve ? 'approved' : 'rejected';
    await booking.save();
    res.json(booking);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

