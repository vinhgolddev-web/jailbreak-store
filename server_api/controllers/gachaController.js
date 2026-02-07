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

    try {
        const gachaCase = await GachaCase.findById(caseId);
        if (!gachaCase) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Atomic Balance Deduction
        // Find user AND check balance >= price in one query
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, balance: { $gte: gachaCase.price } },
            { $inc: { balance: -gachaCase.price } },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ message: 'Số dư không đủ' });
        }

        // Roll logic: Weighted Random
        const items = gachaCase.items;

        if (!items || items.length === 0) {
            // Rollback balance if case is empty (shouldn't happen in production but good for safety)
            await User.findByIdAndUpdate(user._id, { $inc: { balance: gachaCase.price } });
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

        if (!wonItem) {
            wonItem = items[items.length - 1]; // Fallback
        }

        // Ensure wonItem is a plain object for safe merging and property access
        wonItem = wonItem.toObject ? wonItem.toObject() : wonItem;

        // Secret Rarity Logic
        let finalReward = wonItem;
        let isSecret = false;

        if (wonItem.rarity === 'Secret') {
            isSecret = true;

            // Fetch all active secret items to calculate weights
            const secretItems = await SecretItem.find({ active: true });

            if (secretItems.length > 0) {
                // Weighted Random Logic
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

                // Fallback (Precision issues)
                if (!secretReward) {
                    secretReward = secretItems[secretItems.length - 1];
                }

                // Ensure secretReward is object
                const secretRewardObj = secretReward.toObject ? secretReward.toObject() : secretReward;

                // We return both:
                // 1. A placeholder for the spinner (wonItem - usually the question mark or Secret visual)
                // 2. The "Actual" reward (finalReward - e.g. Torpedo)
                // We merge them so frontend has all info
                finalReward = {
                    ...secretRewardObj,
                    originalSecret: wonItem
                };
            } else {
                // Fallback if no secret items in DB
                finalReward = wonItem;
            }
        }

        // Generate Secret Code for ALL items (e.g., CODE-XXXX-XXXX)
        const codePrefix = isSecret ? 'SECRET' : 'GIFT';
        const codeSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
        const secretCode = `${codePrefix}-${codeSuffix}`;

        // Attach code to reward
        finalReward = { ...finalReward, secretCode };

        // Explicitly determine name and image for History to ensure accuracy
        // Validate to prevent crashes
        const historyItemName = finalReward.name || 'Unknown Item';
        const historyItemImage = finalReward.image || 'https://via.placeholder.com/150';
        const historyRarity = finalReward.rarity || 'Common';

        // Save History
        await GachaHistory.create({
            userId: user._id,
            caseId: gachaCase._id,
            caseName: gachaCase.name,
            itemName: historyItemName,
            itemImage: historyItemImage,
            rarity: historyRarity, // Use validated rarity
            isSecret: isSecret,
            secretCode: secretCode,
            pricePaid: gachaCase.price
        });

        res.json({
            wonItem: finalReward, // The real prize
            visualItem: wonItem,  // What the spinner lands on
            newBalance: user.balance
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await GachaHistory.find({ userId: req.user.id }).sort({ rolledAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllHistory = async (req, res) => {
    try {
        // Populate user details for admin view
        const history = await GachaHistory.find().populate('userId', 'username email').sort({ rolledAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getRecentWins = async (req, res) => {
    try {
        // Fetch last 20 wins, populate ONLY username
        const history = await GachaHistory.find()
            .sort({ rolledAt: -1 })
            .limit(20)
            .populate('userId', 'username');

        // Mask usernames for privacy
        const maskedHistory = history.map(h => {
            const doc = h.toObject();
            if (doc.userId && doc.userId.username) {
                const name = doc.userId.username;
                doc.winnerName = name.length > 3
                    ? name.substring(0, 3) + '***'
                    : name.substring(0, 1) + '***';
            } else {
                doc.winnerName = 'Unknown';
            }
            // Remove full user object to prevent leaking ID or other info
            delete doc.userId;
            return doc;
        });

        res.json(maskedHistory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
