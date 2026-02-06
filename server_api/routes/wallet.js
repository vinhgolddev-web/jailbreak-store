const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);


router.get('/history', walletController.getTransactions);

module.exports = router;
