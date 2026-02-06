const User = require('../models/User');

// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};
