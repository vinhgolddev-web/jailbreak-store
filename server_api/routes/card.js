const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { verifyToken } = require('../middleware/auth');

// POST /api/card/charging
router.post('/charging', verifyToken, cardController.submitCard);

// GET/POST /api/card/callback (Optional, based on TSR config)
router.all('/callback', cardController.handleCallback);

module.exports = router;
