const User = require('../models/User');

// Update User Profile (Self)
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        // Whitelist allowed fields. DO NOT allow balance/role updates here.
        const updates = {};

        if (username) {
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (username.length < 3 || username.length > 30 || !usernameRegex.test(username)) {
                return res.status(400).json({ message: 'Username invalid (3-30 chars, alphanumeric)' });
            }
            updates.username = username;
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email' });
            updates.email = email;
        }

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already taken' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
        res.json(users);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Leaderboard (Top 10 Richest)
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ balance: -1 })
            .limit(10)
            .select('username balance avatar') // Public info only
            .lean();
        res.json(users);
    } catch (err) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
// Delete User (Admin Only)
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Self-Destruct Protection
        if (userId === req.user.id) {
            return res.status(403).json({ message: 'You cannot delete your own account.' });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully', userId });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
