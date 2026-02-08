const mongoose = require('mongoose');
const User = require('../models/User');
const GachaCase = require('../models/GachaCase');
const GachaHistory = require('../models/GachaHistory');
const SecretItem = require('../models/SecretItem');

exports.getGachaCases = async (req, res) => {
    try {
        const cases = await GachaCase.find().sort({ price: 1 });
        res.json(cases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.rollGacha = async (req, res) => {
    const { caseId } = req.body;

    if (!caseId || !caseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid Case ID' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const gachaCase = await GachaCase.findById(caseId).session(session);
        if (!gachaCase) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Case not found' });
        }

        // Atomic Balance Deduction
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, balance: { $gte: gachaCase.price } },
            { $inc: { balance: -gachaCase.price } },
            { new: true, session }
        );

        if (!user) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Số dư không đủ' });
        }

        const calculateRoll = require('../utils/calculateRoll');

        // Roll logic
        const items = gachaCase.items;
        if (!items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Case is empty (Contact Admin)' });
        }

        let wonItem = calculateRoll(items);
        wonItem = wonItem.toObject ? wonItem.toObject() : wonItem;

        // Secret Rarity Logic
        let finalReward = wonItem;
        let isSecret = false;

        if (wonItem.rarity === 'Secret') {
            isSecret = true;
            // Fetch active secret items
            const secretItems = await SecretItem.find({ active: true }).session(session);

            if (secretItems.length > 0) {
                // Weighted logic for secrets using Secure RNG
                const secretReward = calculateRoll(secretItems);
                const secretRewardObj = secretReward.toObject ? secretReward.toObject() : secretReward;

                finalReward = {
                    ...secretRewardObj,
                    originalSecret: wonItem
                };

            } else {
                finalReward = wonItem;
            }
        }

        const generateUniqueCode = require('../utils/codeGenerator');

        // ...

        // UNIFIED CODE GENERATION (User Request)
        // Generate an 8-character uppercase alphanumeric code (A-Z, 0-9) - Unique Checked
        const code = await generateUniqueCode(GachaHistory, 'code', 8);

        finalReward = { ...finalReward, code };

        // Save History
        const historyItemName = finalReward.name || 'Unknown Item';
        const historyItemImage = finalReward.image || 'https://via.placeholder.com/150';
        const historyRarity = finalReward.rarity || 'Common';

        await GachaHistory.create([{
            userId: user._id,
            caseId: gachaCase._id,
            caseName: gachaCase.name,
            itemName: historyItemName,
            itemImage: historyItemImage,
            rarity: historyRarity,
            isSecret: isSecret,
            code: code,
            pricePaid: gachaCase.price
        }], { session });

        await session.commitTransaction();

        res.json({
            wonItem: finalReward,
            visualItem: wonItem,
            newBalance: user.balance
        });

    } catch (err) {
        await session.abortTransaction();
        console.error('Roll Gacha Error:', err);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        session.endSession();
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await GachaHistory.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllHistory = async (req, res) => {
    try {
        // Populate user details for admin view
        const history = await GachaHistory.find().populate('userId', 'username email').sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getRecentWins = async (req, res) => {
    try {
        const history = await GachaHistory.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'username');

        // Mask usernames for privacy
        const maskedHistory = history.map(item => {
            const username = item.userId ? item.userId.username : 'Unknown';
            const masked = username.length > 2
                ? `${username.substring(0, 2)}***`
                : `${username.substring(0, 1)}***`;

            return {
                ...item.toObject(),
                username: masked,
                userId: undefined // Remove full user object
            };
        });

        res.json(maskedHistory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
