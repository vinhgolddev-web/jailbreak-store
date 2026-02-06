const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Create Order (Single or Bulk)
exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body; // Expecting array of { productId, quantity }

        // Normalize input: if legacy single purchase, convert to array
        const orderItems = items || (req.body.productId ? [{ productId: req.body.productId, quantity: 1 }] : []);

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // 1. Fetch all products to validate stock and calculate total
        const productIds = orderItems.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length !== orderItems.length) {
            return res.status(404).json({ message: 'One or more products not found' });
        }

        let totalAmount = 0;
        const finalItems = [];

        // Validate stock and calc total
        for (const item of orderItems) {
            const product = products.find(p => p._id.toString() === item.productId);
            if (!product) continue;

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            totalAmount += product.price * item.quantity;
            finalItems.push({
                productId: product._id,
                quantity: item.quantity,
                priceAtPurchase: product.price,
                name: product.name // Temp for logs
            });
        }

        // 2. Atomic Deduct Balance
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, balance: { $gte: totalAmount } },
            { $inc: { balance: -totalAmount } },
            { new: false }
        );

        if (!user) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // 3. Deduct Stock for each item
        const successfulDeductions = [];
        const failedDeductions = [];

        for (const item of finalItems) {
            const updated = await Product.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (updated) {
                successfulDeductions.push(item);
            } else {
                failedDeductions.push(item);
            }
        }

        // Edge Case: If any stock deduction failed (highly unlikely due to check in step 1, but possible in high race conditions)
        if (failedDeductions.length > 0) {
            // Partial refund needed
            const refundAmount = failedDeductions.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
            await User.updateOne({ _id: req.user.id }, { $inc: { balance: refundAmount } });

            // If ALL failed, return error
            if (successfulDeductions.length === 0) {
                return res.status(400).json({ message: 'Transaction failed due to stock changes. You have been refunded.' });
            }

            // If partial success, continue but warn? Or better: fail all.
            // For simplicity in this iteration: we processed what we could. 
            // The user gets the successful items and refund for failed ones.
        }

        // 4. Create Transaction Log
        const Transaction = require('../models/Transaction');

        // Calculate verified total (only successful items)
        const verifiedTotal = successfulDeductions.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

        await Transaction.create({
            userId: user._id,
            type: 'purchase',
            amount: -verifiedTotal,
            balanceBefore: user.balance,
            balanceAfter: user.balance - verifiedTotal, // Approx, exact math complicated by partial refund
            description: `Purchase: ${successfulDeductions.length} items`,
            method: 'balance'
        });

        // 5. Create Order Record
        const order = new Order({
            userId: user._id,
            items: successfulDeductions.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                priceAtPurchase: i.priceAtPurchase
            })),
            totalAmount: verifiedTotal,
            status: 'completed',
            secretCode: Math.floor(1000000000 + Math.random() * 9000000000).toString() // Generate 10-digit code
        });

        await order.save();

        res.status(201).json({
            message: failedDeductions.length > 0 ? 'Partial success. Some items out of stock and refunded.' : 'Purchase successful',
            order
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get User Orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('items.productId').sort({ createdAt: -1 });
        res.json(orders);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'username email').populate('items.productId').sort({ createdAt: -1 });
        res.json(orders);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};
