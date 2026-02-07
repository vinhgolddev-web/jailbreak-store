const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get Dashboard Stats (Revenue, Users, Orders)
exports.getStats = async (req, res) => {
    try {
        // 1. Total Revenue (Sum of completed orders)
        const revenueAgg = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Total Users
        const totalUsers = await User.countDocuments();

        // 3. Total Orders
        const totalOrders = await Order.countDocuments();

        res.json({
            revenue: totalRevenue,
            users: totalUsers,
            orders: totalOrders
        });
    } catch (err) {
        console.error('Admin Stats Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Revenue Chart Data (Last 7 Days)
exports.getChartData = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const chartData = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(chartData);
    } catch (err) {
        console.error('Admin Chart Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Recent Orders (Detailed)
exports.getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'username email')
            .populate('items.productId', 'name')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(orders);
    } catch (err) {
        console.error('Admin Recent Orders Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
