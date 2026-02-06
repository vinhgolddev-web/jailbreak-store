const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes
const { verifyToken } = require('../middleware/auth');
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
