const User = require('../models/User');


// Get User Cart
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.productId');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Filter out null products (if deleted)
        const validCart = user.cart.filter(item => item.productId).map(item => ({
            ...item.productId.toObject(),
            quantity: item.quantity,
            _id: item.productId._id // Ensure top-level ID matches product ID for frontend compatibility
        }));

        res.json(validCart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Sync Cart (Overwrite / Merge)
exports.syncCart = async (req, res) => {
    try {
        const { cart } = req.body; // Expecting array of { _id, quantity }

        // Transform frontend cart to schema format
        const dbCart = cart.map(item => ({
            productId: item._id,
            quantity: item.quantity
        }));

        // Update user
        await User.findByIdAndUpdate(req.user.id, { cart: dbCart });

        res.json({ message: 'Cart synced' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
