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
server.use(express.json());
server.use(cors());
server.use(helmet({ contentSecurityPolicy: false }));
server.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
server.use('/api', limiter); // Apply to all API routes

// --- API Routes ---
server.use('/api/auth', require('./server_api/routes/auth'));
server.use('/api/products', require('./server_api/routes/products'));
server.use('/api/orders', require('./server_api/routes/orders'));
server.use('/api/users', require('./server_api/routes/users'));
server.use('/api/cart', require('./server_api/routes/cart')); // Added Cart Route
server.use('/api/wallet', require('./server_api/routes/wallet'));
server.use('/api/payment', require('./server_api/routes/payment'));

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
