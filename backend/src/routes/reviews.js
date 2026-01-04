// routes/reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get reviews for a listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create a review (authenticated users only, must have booked the listing)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    if (!listingId || !rating) {
      return res.status(400).json({ message: 'Listing ID and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this listing
    const existingReview = await Review.findOne({ listing: listingId, user: req.user._id });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this listing' });
    }

    const review = new Review({
      listing: listingId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment || ''
    });
    await review.save();

    // Update listing's average rating
    await updateListingRating(listingId);

    const populatedReview = await Review.findById(review._id).populate('user', 'name email');
    res.json(populatedReview);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this listing' });
    }
    res.status(500).json({ message: e.message });
  }
});

// Update a review (own review only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (!review.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (req.body.rating !== undefined) {
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = Number(req.body.rating);
    }
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();

    // Update listing's average rating
    await updateListingRating(review.listing);

    const populatedReview = await Review.findById(review._id).populate('user', 'name email');
    res.json(populatedReview);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete a review (own review or admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (!review.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const listingId = review.listing;
    await Review.findByIdAndDelete(req.params.id);

    // Update listing's average rating
    await updateListingRating(listingId);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Helper function to update listing's average rating
async function updateListingRating(listingId) {
  const reviews = await Review.find({ listing: listingId });
  if (reviews.length === 0) {
    await Listing.findByIdAndUpdate(listingId, { $unset: { averageRating: 1, reviewCount: 1 } });
    return;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  await Listing.findByIdAndUpdate(listingId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    reviewCount: reviews.length
  });
}

module.exports = router;

