const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (password.length < 6 || password.length > 100) {
            return res.status(400).json({ message: 'Password must be between 6 and 100 characters' });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sanitize input: Ensure email and password are strings
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};
