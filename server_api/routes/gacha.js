const express = require('express');
const router = express.Router();
const gachaController = require('../controllers/gachaController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET /api/gacha
// @desc    Get all gacha cases
// @access  Public
router.get('/', gachaController.getGachaCases);

const rateLimit = require('express-rate-limit');

const rollLimiter = rateLimit({
    windowMs: 2000, // 2 seconds
    max: 1, // Limit each user to 1 request per 2 seconds
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user.id, // User-based limit (verifyToken ensures req.user exists)
    message: { message: "Please wait for the animation to finish!" }
});

// @route   POST /api/gacha/roll
// @desc    Open a case
// @access  Private
router.post('/roll', verifyToken, gachaController.rollGacha);

// @route   GET /api/gacha/history
// @desc    Get user's gacha history
// @access  Private
router.get('/history', verifyToken, gachaController.getHistory);

// @route   GET /api/gacha/history/all
// @desc    Get all gacha history (Admin)
// @access  Private (Admin)
router.get('/history/all', isAdmin, gachaController.getAllHistory);

module.exports = router;
