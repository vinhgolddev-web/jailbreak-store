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

        // Secret Rarity Logic
        let finalReward = wonItem;
        let isSecret = false;

        if (wonItem.rarity === 'Secret') {
            isSecret = true;
            // Pick a random secret reward from DB
            const secretCount = await SecretItem.countDocuments({ active: true });

            if (secretCount > 0) {
                const randomInfo = Math.floor(Math.random() * secretCount);
                const secretReward = await SecretItem.findOne({ active: true }).skip(randomInfo);

                // Generate Secret Code (e.g., SECRET-1234-5678)
                const codeSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
                const secretCode = `SECRET-${codeSuffix}`;

                // We return both:
                // 1. A placeholder for the spinner (wonItem - usually the question mark or Secret visual)
                // 2. The "Actual" reward (finalReward - e.g. Torpedo)
                // We merge them so frontend has all info
                finalReward = {
                    ...secretReward.toObject(),
                    originalSecret: wonItem,
                    secretCode: secretCode // Attach code to reward
                };
            } else {
                // Fallback if no secret items in DB
                finalReward = wonItem;
            }
        }

        // Save History
        await GachaHistory.create({
            userId: user._id,
            caseId: gachaCase._id,
            caseName: gachaCase.name,
            itemName: finalReward.name,
            itemImage: finalReward.image,
            rarity: finalReward.rarity,
            isSecret: isSecret,
            secretCode: finalReward.secretCode || null,
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
