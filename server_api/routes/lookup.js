const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookupController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET /api/lookup/search
// @desc    Search for Gacha or Order by code
// @access  Admin only
router.get('/search', verifyToken, isAdmin, lookupController.searchCode);

// @route   POST /api/lookup/claim
// @desc    Mark item/order as claimed/completed
// @access  Admin only
router.post('/claim', verifyToken, isAdmin, lookupController.updateStatus);

module.exports = router;
