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

server.use(morgan('dev'));

// Rate Limiting
// 1. Global API Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

// 2. Strict Auth Limiter (Brute Force Protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Max 10 attempts per 15 min
    message: { message: 'Too many login attempts. Please try again in 15 minutes.' }
});

server.use('/api', apiLimiter);
server.use('/api/auth/login', authLimiter); // Apply stricter limit to login
server.use('/api/auth/register', authLimiter);

// --- API Routes ---
server.use('/api/auth', require('./server_api/routes/auth'));
server.use('/api/products', require('./server_api/routes/products'));
server.use('/api/orders', require('./server_api/routes/orders'));
server.use('/api/users', require('./server_api/routes/users'));
server.use('/api/cart', require('./server_api/routes/cart'));
server.use('/api/wallet', require('./server_api/routes/wallet'));
server.use('/api/payment', require('./server_api/routes/payment'));
server.use('/api/card', require('./server_api/routes/card')); // Scratch Card Routes

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('[DB ERROR]', err.message);
        process.exit(1);
    }
};

mongoose.connection.on('error', err => console.error('[MONGOOSE ERROR]', err));
mongoose.connection.on('disconnected', () => console.warn('[MONGOOSE] Disconnected'));

// Connect first, then start server
connectDB().then(() => {
    app.prepare().then(() => {
        // Handle everything else with Next.js (Express 5 fix)
        server.all(/(.*)/, (req, res) => handle(req, res));

        server.listen(PORT, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${PORT}`);
        });
    });
});

// Global Error Handler
server.use((err, req, res, next) => {
    console.error('[SERVER ERROR] Stack:', err.stack);
    console.error('[SERVER ERROR] Message:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = server;
