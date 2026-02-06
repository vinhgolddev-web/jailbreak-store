const Transaction = require('../models/Transaction');




// Get Wallet History
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};
