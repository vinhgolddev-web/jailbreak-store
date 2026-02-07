const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/orders/recent (Public)
router.get('/recent', orderController.getRecentOrders);

router.use(verifyToken); // Apply auth to all routes BELOW this line

const rateLimit = require('express-rate-limit');

const buyLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 1, // Limit each User to 1 request per second
    keyGenerator: (req, res) => {
        if (req.user) return req.user.id;
        return req.ip;
    },
    legacyHeaders: false,
    standardHeaders: true,
    message: { message: "Transaction too fast. Please wait 1 second." },
    validate: {
        xForwardedForHeader: false,
        default: true,
        ip: false
    }
});

// GET /api/orders
router.get('/', orderController.getMyOrders);

// POST /api/orders (Purchase)
router.post('/', buyLimiter, orderController.createOrder);

router.get('/all', isAdmin, orderController.getAllOrders); // Admin

module.exports = router;
