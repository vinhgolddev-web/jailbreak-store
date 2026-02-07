const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(isAdmin);

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// GET /api/admin/chart
router.get('/chart', adminController.getChartData);

// GET /api/admin/orders
router.get('/orders', adminController.getRecentOrders);

module.exports = router;
