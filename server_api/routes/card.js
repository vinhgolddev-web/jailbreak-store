const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/card/charging
router.post('/charging', protect, cardController.submitCard);

// GET/POST /api/card/callback (Optional, based on TSR config)
router.all('/callback', cardController.handleCallback);

module.exports = router;
