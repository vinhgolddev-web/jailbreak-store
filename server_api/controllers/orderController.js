const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Create Order (Atomic Transaction)
exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items } = req.body;
        const orderItems = items || (req.body.productId ? [{ productId: req.body.productId, quantity: 1 }] : []);

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        // 1. Fetch products
        const productIds = orderItems.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds } }).session(session);

        if (products.length !== orderItems.length) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Một hoặc nhiều sản phẩm không tìm thấy' });
        }

        let totalAmount = 0;
        const finalItems = [];

        // 2. Validate Stock & Calculate Total
        for (const item of orderItems) {
            // CRITICAL SECURITY: Prevent negative/zero quantity (Money printer exploit)
            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Số lượng không hợp lệ' });
            }

            const product = products.find(p => p._id.toString() === item.productId);

            if (product.stock < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng` });
            }

            totalAmount += product.price * item.quantity;
            finalItems.push({
                productId: product._id,
                quantity: item.quantity,
                priceAtPurchase: product.price
            });
        }

        // 3. Atomic Balance Deduction (With Session)
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, balance: { $gte: totalAmount } },
            { $inc: { balance: -totalAmount } },
            { new: true, session }
        );

        if (!user) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Số dư không đủ. Vui lòng nạp thêm tiền!' });
        }

        // 4. Atomic Stock Deduction (With Session)
        for (const item of finalItems) {
            await Product.updateOne(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } }
            ).session(session);
        }

        // 5. Create Transaction Log
        const Transaction = require('../models/Transaction');
        await Transaction.create([{
            userId: user._id,
            type: 'purchase',
            amount: -totalAmount,
            balanceBefore: user.balance + totalAmount,
            balanceAfter: user.balance,
            description: `Purchase: ${finalItems.length} items`,
            method: 'balance'
        }], { session });

        // 6. Create Order
        const order = new Order({
            userId: user._id,
            items: finalItems,
            totalAmount: totalAmount,
            status: 'completed',
            secretCode: Math.floor(1000000000 + Math.random() * 9000000000).toString()
        });

        // Save order with session
        await order.save({ session });

        // Commit Transaction (Success)
        await session.commitTransaction();

        // 7. Send Email (Async, outside transaction)
        const { sendOrderNotification } = require('../utils/mailer');
        sendOrderNotification(order).catch(err => console.error("Email failed:", err));

        res.status(201).json({ message: 'Purchase successful', order });

    } catch (err) {
        // Rollback on any error
        await session.abortTransaction();
        console.error('Order Transaction Failed:', err);
        res.status(500).json({ message: 'Transaction failed', error: err.message });
    } finally {
        session.endSession();
    }
};

// Get User Orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('items.productId').sort({ createdAt: -1 }).lean();
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

// Get Recent Orders (Public - Limited Data)
exports.getRecentOrders = async (req, res) => {
    try {
        // Fetch last 10 completed orders
        const orders = await Order.find({ status: 'completed' })
            .select('userId items createdAt')
            .populate('userId', 'username')
            .populate('items.productId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Format for public privacy (mask username)
        const recentSales = orders.map(order => {
            const username = order.userId?.username || 'Guest';
            const maskedUser = username.length > 2
                ? `${username.substring(0, 2)}***${username.substring(username.length - 1)}`
                : `${username.substring(0, 1)}***`;

            return {
                id: order._id,
                user: maskedUser,
                product: order.items[0]?.productId?.name || 'Vật phẩm ẩn',
                time: order.createdAt
            };
        });

        res.json(recentSales);
    } catch (err) {
        console.error('Recent Orders Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
