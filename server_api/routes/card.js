const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { verifyToken } = require('../middleware/auth');

// POST /api/card/charging (Temporarily Disabled)
// router.post('/charging', verifyToken, cardController.submitCard);

router.post('/charging', verifyToken, (req, res) => {
    res.status(503).json({ message: 'Tính năng nạp thẻ đang bảo trì.' });
});

// GET/POST /api/card/callback (Optional, based on TSR config)
router.all('/callback', cardController.handleCallback);

module.exports = router;
