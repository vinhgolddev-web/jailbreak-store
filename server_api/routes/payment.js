const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Create Link (Protected)
router.post('/create-link', verifyToken, paymentController.createPaymentLink);

// Webhook (Public, verified by signature)
router.post('/webhook', paymentController.handleWebhook);

// Verify Payment (Called after user returns from PayOS)
router.get('/verify/:orderCode', verifyToken, paymentController.verifyPayment);

module.exports = router;
