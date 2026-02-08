const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { verifyToken, isSeller } = require('../middleware/auth');

// @route   GET /api/market
// @desc    Get active listings
// @access  Public
router.get('/', marketController.getListings);

// @route   GET /api/market/me
// @desc    Get my listings
// @access  Private
router.get('/me', verifyToken, marketController.getMyListings);

// @route   POST /api/market/register
// @desc    Register as seller
// @access  Private
router.post('/register', verifyToken, marketController.registerSeller);

// @route   POST /api/market/create
// @desc    Create listing
// @access  Private (Seller)
router.post('/create', verifyToken, isSeller, marketController.createListing);

// @route   POST /api/market/buy/:id
// @desc    Buy listing
// @access  Private
router.post('/buy/:id', verifyToken, marketController.purchaseListing);

module.exports = router;
