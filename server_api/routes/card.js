const express = require('express');
const router = express.Router();
const router = express.Router();
const cardController = require('../controllers/cardController');
const { verifyToken } = require('../middleware/auth');

// POST /api/card/submit - User submits card
router.post('/submit', verifyToken, cardController.submitCard);

// GET/POST /api/card/callback - Provider calls this
router.get('/callback', cardController.handleCallback);
router.post('/callback', cardController.handleCallback);

module.exports = router;
