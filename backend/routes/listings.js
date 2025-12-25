const router = require('express').Router();
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/listings
// @desc    Create a new listing (vendors only)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType !== 'vendor') {
      return res.status(403).json({ msg: 'Only vendors can create listings' });
    }

    const {
      title,
      description,
      price,
      location,
      imageUrl,
      listingType,
      amenities
    } = req.body;

    // Validation
    if (!title || !description || !price || !listingType) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    if (price <= 0) {
      return res.status(400).json({ msg: 'Price must be greater than 0' });
    }

    if (!['room', 'food'].includes(listingType)) {
      return res.status(400).json({ msg: 'Invalid listing type' });
    }

    const newListing = new Listing({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      location: location || {},
      imageUrl: imageUrl?.trim() || '',
      listingType,
      vendor: req.user.id,
      amenities: amenities || []
    });

    const listing = await newListing.save();
    const populatedListing = await Listing.findById(listing._id).populate('vendor', 'name email');

    res.json({
      listing: populatedListing,
      msg: 'Listing created successfully'
    });
  } catch (err) {
    console.error('Create listing error:', err.message);
    res.status(500).json({ msg: 'Server error while creating listing' });
  }
});

// @route   GET /api/listings
// @desc    Get all available listings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, city, minPrice, maxPrice, limit = 20, page = 1 } = req.query;

    let filter = { availability: true };

    // Add filters
    if (type && ['room', 'food'].includes(type)) {
      filter.listingType = type;
    }

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = parseFloat(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: listings.length,
        totalListings: total
      }
    });
  } catch (err) {
    console.error('Get listings error:', err.message);
    res.status(500).json({ msg: 'Server error while fetching listings' });
  }
});

// @route   GET /api/listings/my-listings
// @desc    Get all listings for the logged-in vendor
// @access  Private (vendors only)
router.get('/my-listings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType !== 'vendor') {
      return res.status(403).json({ msg: 'Only vendors can view their listings' });
    }

    const listings = await Listing.find({ vendor: req.user.id })
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    console.error('Get my listings error:', err.message);
    res.status(500).json({ msg: 'Server error while fetching your listings' });
  }
});

// @route   GET /api/listings/:id
// @desc    Get a single listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('vendor', 'name email');

    if (!listing) {
      return res.status(404).json({ msg: 'Listing not found' });
    }

    res.json(listing);
  } catch (err) {
    console.error('Get listing error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Listing not found' });
    }
    res.status(500).json({ msg: 'Server error while fetching listing' });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing (vendor only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType !== 'vendor') {
      return res.status(403).json({ msg: 'Only vendors can update listings' });
    }

    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ msg: 'Listing not found' });
    }

    if (listing.vendor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this listing' });
    }

    const {
      title,
      description,
      price,
      imageUrl,
      listingType,
      location,
      amenities,
      availability
    } = req.body;

    // Validation
    if (price && price <= 0) {
      return res.status(400).json({ msg: 'Price must be greater than 0' });
    }

    if (listingType && !['room', 'food'].includes(listingType)) {
      return res.status(400).json({ msg: 'Invalid listing type' });
    }

    // Update fields
    const updateFields = {};
    if (title) updateFields.title = title.trim();
    if (description) updateFields.description = description.trim();
    if (price) updateFields.price = parseFloat(price);
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl.trim();
    if (listingType) updateFields.listingType = listingType;
    if (location) updateFields.location = location;
    if (amenities) updateFields.amenities = amenities;
    if (availability !== undefined) updateFields.availability = availability;

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('vendor', 'name email');

    res.json({
      listing,
      msg: 'Listing updated successfully'
    });
  } catch (err) {
    console.error('Update listing error:', err.message);
    res.status(500).json({ msg: 'Server error while updating listing' });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing (vendor only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType !== 'vendor') {
      return res.status(403).json({ msg: 'Only vendors can delete listings' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ msg: 'Listing not found' });
    }

    if (listing.vendor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Delete listing error:', err.message);
    res.status(500).json({ msg: 'Server error while deleting listing' });
  }
});

module.exports = router;
