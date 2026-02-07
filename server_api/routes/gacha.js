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

// @route   GET /api/gacha/history
// @desc    Get user's gacha history
// @access  Private
router.get('/history', verifyToken, gachaController.getHistory);

// @route   GET /api/gacha/history/all
// @desc    Get all gacha history (Admin)
// @access  Private (Admin check should be here, but using verifyToken for now)
router.get('/history/all', verifyToken, gachaController.getAllHistory);

module.exports = router;
