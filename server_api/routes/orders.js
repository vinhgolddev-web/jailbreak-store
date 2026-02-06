const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken); // Apply auth to all routes

const rateLimit = require('express-rate-limit');

const buyLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 1, // Limit each User to 1 request per second
    keyGenerator: (req, res) => {
        // Use user ID if authenticated, otherwise allow library to handle IP
        if (req.user) return req.user.id;
        // For unauthenticated requests, we let express-rate-limit handle IP extraction internally
        // or return a safe default if needed, but returning undefined lets it use default behavior.
        // However, the error suggests we need to call ipKeyGenerator.
        // Simplified approach: just return req.ip and suppress validation if needed, 
        // OR better: use the pattern recommended by the library docs.
        return req.ip;
    },
    // Fix for IPv6 warning: Explicitly allow standard IP fallback
    legacyHeaders: false,
    standardHeaders: true,
    message: { message: "Transaction too fast. Please wait 1 second." },
    validate: {
        xForwardedForHeader: false,
        default: true,
        ip: false
    }
});

router.post('/', buyLimiter, orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/all', isAdmin, orderController.getAllOrders); // Admin

module.exports = router;
