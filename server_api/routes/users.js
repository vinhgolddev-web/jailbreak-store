const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAdmin } = require('../middleware/auth');

// Admin only
router.get('/', isAdmin, userController.getAllUsers);

// Public Leaderboard
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;
