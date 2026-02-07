const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// Initialize Express
const server = express();

// Trust Proxy (Required for Railway/Heroku/Nginx)
server.set('trust proxy', 1);

const rateLimit = require('express-rate-limit');

// Middleware
server.use(express.json({ limit: '10kb' })); // Body limit prevents DOS
server.use(cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Headers (CSP)
server.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Next.js
            styleSrc: ["'self'", "'unsafe-inline'"], // Needed for styles
            imgSrc: ["'self'", "data:", "https:"], // Allow external images (wallpapers.com)
            connectSrc: ["'self'", "https:", "wss:"], // wss: for HMR
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:"],
            frameSrc: ["'self'", "https:"],
        },
    },
}));

// Add Permissions-Policy Header
server.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
    next();
});

// Custom NoSQL Injection Sanitizer
const mongoSanitize = (v) => {
    if (v instanceof Object) {
        for (const key in v) {
            if (/^\$/.test(key)) {
                delete v[key];
            } else {
                mongoSanitize(v[key]);
            }
        }
    }
    return v;
};

server.use((req, res, next) => {
    req.body = mongoSanitize(req.body);
    req.query = mongoSanitize(req.query);
    req.params = mongoSanitize(req.params);
    next();
});

server.use(morgan('dev'));

// Rate Limiters
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." },
    validate: {
        xForwardedForHeader: false, // Disable strict validation for proxies/IPv6
        default: true
    }
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per hour (Strict for Lookup)
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many lookup attempts, please try again in an hour." },
    validate: {
        xForwardedForHeader: false, // Disable strict validation for proxies/IPv6
        default: true
    }
});

// Apply Global Limiter to API routes (excluding specific ones if needed)
server.use('/api', globalLimiter);

// Routes
server.use('/api/auth', require('./server_api/routes/auth'));
server.use('/api/users', require('./server_api/routes/users'));
server.use('/api/products', require('./server_api/routes/products'));
server.use('/api/cart', require('./server_api/routes/cart'));
server.use('/api/orders', require('./server_api/routes/orders'));
server.use('/api/payment', require('./server_api/routes/payment'));
server.use('/api/wallet', require('./server_api/routes/wallet'));
server.use('/api/card', require('./server_api/routes/card'));
server.use('/api/gacha', require('./server_api/routes/gacha')); // Gacha System
server.use('/api/admin', require('./server_api/routes/admin')); // Admin Dashboard
server.use('/api/lookup', authLimiter, require('./server_api/routes/lookup')); // Code Lookup Tool (Strict Limit)

// ...

// Global Error Handler
server.use((err, req, res, next) => {
    console.error('[SERVER ERROR] Stack:', err.stack);
    console.error('[SERVER ERROR] Message:', err.message);

    // Hide stack trace in response
    const response = {
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    };

    res.status(500).json(response);
});

// Process-level Error Handling (Safety Net)
process.on('unhandledRejection', (err) => {
    console.error('[UNHANDLED REJECTION] Shutting down...', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION] Shutting down...', err);
    process.exit(1);
});

module.exports = server;
