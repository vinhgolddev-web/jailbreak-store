const GachaHistory = require('../models/GachaHistory');
const Order = require('../models/Order');

exports.searchCode = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: 'Missing code parameter' });
        }

        const cleanCode = code.trim();

        // 1. Search in Gacha History
        const gachaResult = await GachaHistory.findOne({ secretCode: cleanCode })
            .populate('userId', 'username email')
            .lean();

        if (gachaResult) {
            return res.json({
                type: 'GACHA',
                data: gachaResult,
                found: true
            });
        }

        // 2. Search in Orders (Secret Code or Order ID)
        let orderResult = await Order.findOne({ secretCode: cleanCode })
            .populate('userId', 'username email')
            .populate('items.productId', 'name image rarity')
            .lean();

        // If not found by secret code, try Order ID (if format matches MongoID)
        if (!orderResult && cleanCode.match(/^[0-9a-fA-F]{24}$/)) {
            orderResult = await Order.findById(cleanCode)
                .populate('userId', 'username email')
                .populate('items.productId', 'name image rarity')
                .lean();
        }

        if (orderResult) {
            return res.json({
                type: 'ORDER',
                data: orderResult,
                found: true
            });
        }

        return res.json({ found: false, message: 'Code not found' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update status (Claim Item)
exports.updateStatus = async (req, res) => {
    try {
        const { id, type } = req.body;

        if (!id || !type) {
            return res.status(400).json({ message: 'Missing ID or Type' });
        }

        if (type === 'GACHA') {
            const item = await GachaHistory.findById(id);
            if (!item) return res.status(404).json({ message: 'Item not found' });

            item.status = 'claimed';
            await item.save();
            return res.json({ success: true, message: 'Item marked as CLAIMED', data: item });
        }

        if (type === 'ORDER') {
            const order = await Order.findById(id);
            if (!order) return res.status(404).json({ message: 'Order not found' });

            order.status = 'completed';
            await order.save();
            return res.json({ success: true, message: 'Order marked as COMPLETED', data: order });
        }

        res.status(400).json({ message: 'Invalid Type' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
