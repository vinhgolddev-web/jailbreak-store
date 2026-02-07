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

        // Roll logic
        const items = gachaCase.items;
        if (!items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Case is empty (Contact Admin)' });
        }

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

        if (!wonItem) wonItem = items[items.length - 1]; // Fallback

        wonItem = wonItem.toObject ? wonItem.toObject() : wonItem;

        // Secret Rarity Logic
        let finalReward = wonItem;
        let isSecret = false;

        if (wonItem.rarity === 'Secret') {
            isSecret = true;
            // Fetch active secret items
            const secretItems = await SecretItem.find({ active: true }).session(session);

            if (secretItems.length > 0) {
                // Weighted logic for secrets
                const totalSecretWeight = secretItems.reduce((sum, item) => sum + (item.probability || 0), 0);
                let randomSecret = Math.random() * totalSecretWeight;
                let secretReward = null;

                for (const item of secretItems) {
                    if (randomSecret < (item.probability || 0)) {
                        secretReward = item;
                        break;
                    }
                    randomSecret -= (item.probability || 0);
                }

                if (!secretReward) secretReward = secretItems[secretItems.length - 1];

                const secretRewardObj = secretReward.toObject ? secretReward.toObject() : secretReward;

                finalReward = {
                    ...secretRewardObj,
                    originalSecret: wonItem
                };

            } else {
                finalReward = wonItem;
            }
        }

        // UNIFIED CODE GENERATION (User Request)
        // Generate a 10-digit code for ALL Gacha wins, similar to Orders
        const secretCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        finalReward = { ...finalReward, secretCode };

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
            secretCode: secretCode,
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
