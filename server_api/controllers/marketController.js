const mongoose = require('mongoose');
const MarketListing = require('../models/MarketListing');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Register as Seller
exports.registerSeller = async (req, res) => {
    try {
        const { facebookLink } = req.body;

        if (!facebookLink || !facebookLink.includes('facebook.com')) {
            return res.status(400).json({ message: 'Vui lòng cung cấp link Facebook hợp lệ!' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { role: 'seller', facebookLink: facebookLink },
            { new: true }
        );

        res.json({ message: 'Đăng ký bán hàng thành công!', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Create Listing
exports.createListing = async (req, res) => {
    try {
        const { name, price, image, description } = req.body;

        if (price < 2000) {
            return res.status(400).json({ message: 'Giá bán tối thiểu là 2,000 VNĐ' });
        }

        const newListing = await MarketListing.create({
            sellerId: req.user.id,
            name,
            price,
            image,
            description
        });

        res.status(201).json(newListing);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get Listings
exports.getListings = async (req, res) => {
    try {
        const listings = await MarketListing.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .populate('sellerId', 'username avatar facebookLink'); // Populate seller info

        res.json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Purchase Listing (Atomic)
exports.purchaseListing = async (req, res) => {
    const listingId = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch Listing (Lock check done via status)
        const listing = await MarketListing.findOne({
            _id: listingId,
            status: 'active'
        }).session(session);

        if (!listing) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Vật phẩm không tồn tại hoặc đã bán.' });
        }

        if (listing.sellerId.toString() === req.user.id) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Bạn không thể tự mua hàng của mình!' });
        }

        // 2. Fetch Buyer
        const buyer = await User.findById(req.user.id).session(session);
        if (buyer.balance < listing.price) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Số dư không đủ!' });
        }

        // 3. Financial Logic
        const fee = listing.price * 0.05; // 5% Fee
        const sellerReceive = listing.price - fee;

        // Deduct Buyer
        buyer.balance -= listing.price;
        await buyer.save({ session });

        // Credit Seller
        const seller = await User.findByIdAndUpdate(
            listing.sellerId,
            { $inc: { balance: sellerReceive } },
            { new: true, session }
        );

        // 4. Update Listing
        const generateUniqueCode = require('../utils/codeGenerator');
        const code = await generateUniqueCode(MarketListing, 'code', 8);

        listing.status = 'sold';
        listing.buyerId = buyer._id;
        listing.code = code;
        listing.soldAt = Date.now();
        await listing.save({ session });

        // 5. Create Transaction Logs
        // Buyer Log
        await Transaction.create([{
            userId: buyer._id,
            type: 'purchase',
            amount: -listing.price,
            balanceBefore: buyer.balance + listing.price,
            balanceAfter: buyer.balance,
            description: `Mua vật phẩm chợ: ${listing.name}`,
            method: 'balance'
        }], { session });

        // Seller Log
        await Transaction.create([{
            userId: seller._id,
            type: 'deposit', // Treat as income
            amount: sellerReceive,
            balanceBefore: seller.balance - sellerReceive,
            balanceAfter: seller.balance,
            description: `Bán thành công: ${listing.name} (Phí sàn 5%)`,
            method: 'balance'
        }], { session });

        await session.commitTransaction();

        res.json({
            message: 'Giao dịch thành công!',
            sellerFacebook: seller.facebookLink,
            code: code,
            newBalance: buyer.balance
        });

    } catch (err) {
        await session.abortTransaction();
        console.error("Market Purchase Error:", err);
        res.status(500).json({ message: 'Giao dịch thất bại' });
    } finally {
        session.endSession();
    }
};

// Get My Listings (Sold/Active)
exports.getMyListings = async (req, res) => {
    try {
        const listings = await MarketListing.find({ sellerId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get My Purchases
exports.getMyPurchases = async (req, res) => {
    try {
        const purchases = await MarketListing.find({ buyerId: req.user.id, status: 'sold' })
            .sort({ soldAt: -1 })
            .populate('sellerId', 'username avatar facebookLink');
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
