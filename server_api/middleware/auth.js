const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // Check for missing secret (Dev Safety)
    if (!process.env.JWT_SECRET) {
        console.error('FATAL: JWT_SECRET is not defined.');
        return res.status(500).json({ message: 'Server Configuration Error' });
    }

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const User = require('../models/User');

const isAdmin = (req, res, next) => {
    const checkRole = async () => {
        try {
            // Strict Mode: Check DB for latest role (banned/demoted admins)
            const user = await User.findById(req.user.id);
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin only.' });
            }
            next();
        } catch (err) {
            res.status(500).json({ message: 'Server error checking admin privileges' });
        }
    };

    if (req.user) {
        checkRole();
    } else {
        verifyToken(req, res, checkRole);
    }
};

module.exports = { verifyToken, isAdmin };
