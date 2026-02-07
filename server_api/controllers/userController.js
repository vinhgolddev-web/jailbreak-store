const User = require('../models/User');

// Update User Profile (Self)
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        // Whitelist allowed fields. DO NOT allow balance/role updates here.
        const updates = {};
        if (username) updates.username = username;
        if (email) updates.email = email;

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (_err) {
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
