const express = require('express');
const router = express.Router();
const gachaController = require('../controllers/gachaController');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/gacha
// @desc    Get all gacha cases
// @access  Public
router.get('/', gachaController.getGachaCases);

// @route   POST /api/gacha/roll
// @desc    Open a case
// @access  Private
router.post('/roll', verifyToken, gachaController.rollGacha);

module.exports = router;
