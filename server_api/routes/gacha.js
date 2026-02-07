const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GachaCase = require('../models/GachaCase');
const Order = require('../models/Order'); // Reuse Order for history or create new? Let's use Order with type 'GACHA' if strict, but maybe simplified for now.
// Actually, let's keep it simple: Just deduct balance and return item. We can add history later if needed, or stick it in a 'Transaction' if we had one.
// Wait, we do have Transaction model in seed.js? Let's check.
// Using 'Order' for now is safe for "purchase history".

const { verifyToken } = require('../middleware/auth');

// @route   GET /api/gacha
// @desc    Get all gacha cases
// @access  Public
router.get('/', async (req, res) => {
    try {
        const cases = await GachaCase.find().sort({ price: 1 });
        res.json(cases);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/gacha/roll
// @desc    Open a case
// @access  Private
router.post('/roll', verifyToken, async (req, res) => {
    const { caseId } = req.body;

    try {
        const gachaCase = await GachaCase.findById(caseId);
        if (!gachaCase) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const user = await User.findById(req.user.id);
        if (user.balance < gachaCase.price) {
            return res.status(400).json({ message: 'Số dư không đủ' });
        }

        // Deduct balance
        user.balance -= gachaCase.price;
        await user.save();

        // Roll logic: Weighted Random
        const items = gachaCase.items;
        const totalWeight = items.reduce((sum, item) => sum + item.probability, 0);
        let random = Math.random() * totalWeight;

        let wonItem = null;
        for (const item of items) {
            if (random < item.probability) {
                wonItem = item;
                break;
            }
            random -= item.probability;
        }

        if (!wonItem) {
            wonItem = items[items.length - 1]; // Fallback
        }

        // TODO: Save to history/transaction log if stricter tracking is needed.
        // For now, just return the result.

        res.json({
            wonItem,
            newBalance: user.balance
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
