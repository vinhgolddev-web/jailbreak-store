const User = require('../models/User');
const Transaction = require('../models/Transaction');
const cardProvider = require('../utils/cardProvider');
const crypto = require('crypto');

// Submit Card
exports.submitCard = async (req, res) => {
    try {
        const { telco, code, serial, amount } = req.body;

        if (!telco || !code || !serial || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Create Pending Transaction
        // Generate a numeric ID for the request (timestamp + random)
        const request_id = Date.now().toString() + Math.floor(Math.random() * 1000);

        const transaction = await Transaction.create({
            userId: req.user.id,
            type: 'deposit',
            amount: amount, // Potential amount
            balanceBefore: 0, // Unknown until success
            balanceAfter: 0,
            description: `Scratch Card: ${telco} ${amount}`,
            method: 'card',
            status: 'pending',
            orderCode: Number(request_id), // Use orderCode to store request_id
            metadata: { telco, code, serial }
        });

        // 2. Submit to Provider
        const result = await cardProvider.submitCard(telco, code, serial, amount, request_id);

        // Check immediate response (Provider dependent)
        // Usually providers return { status: 99 } for pending
        if (result.status === 99 || result.status === 1) {
            return res.json({
                message: 'Card submitted. Please wait for processing.',
                status: 'pending',
                transactionId: transaction._id
            });
        } else {
            // Immediate failure
            transaction.status = 'failed';
            transaction.description += ` | Failed: ${result.message}`;
            await transaction.save();

            return res.status(400).json({ message: result.message || 'Card rejected' });
        }

    } catch (error) {
        console.error('Submit Card Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle Callback (Webhook)
exports.handleCallback = async (req, res) => {
    try {
        const { status, message, request_id, trans_id, value, amount, code, serial, callback_sign } = req.body; // Check query if GET

        // NOTE: Thesieure usually sends GET or POST. We handle both by checking params.
        const data = Object.keys(req.body).length > 0 ? req.body : req.query;

        const txnId = data.request_id;
        const statusCode = parseInt(data.status);

        console.log("Card Callback:", data);

        // 1. Validate Signature (Optional/Required based on strictness)
        // const mySign = crypto.createHash('md5').update(process.env.TSR_PARTNER_KEY + data.code + data.serial).digest('hex');
        // if (mySign !== data.callback_sign) return res.status(400).send('Invalid Signature');

        // 2. Find Transaction
        const transaction = await Transaction.findOne({ orderCode: Number(txnId) });
        if (!transaction) return res.status(404).send('Transaction not found');

        if (transaction.status === 'completed') return res.status(200).send('Already completed');

        // 3. Process Status
        if (statusCode === 1) {
            // Success
            const realAmount = parseInt(data.value); // Real value received

            // Atomic Balance Update
            const user = await User.findByIdAndUpdate(
                transaction.userId,
                { $inc: { balance: realAmount } },
                { new: true }
            );

            transaction.status = 'completed';
            transaction.amount = realAmount; // Update with real value
            transaction.balanceAfter = user.balance;
            transaction.description = `Card Success: ${data.telco} - Value: ${realAmount}`;
            await transaction.save();

        } else if (statusCode === 2) {
            // Success but wrong amount penalty (if applicable)
            const realAmount = parseInt(data.value);
            const user = await User.findByIdAndUpdate(
                transaction.userId,
                { $inc: { balance: realAmount } },
                { new: true }
            );

            transaction.status = 'completed';
            transaction.amount = realAmount;
            transaction.balanceAfter = user.balance;
            transaction.description = `Card Wrong Amount: ${realAmount} (Declared: ${data.amount})`;
            await transaction.save();

        } else {
            // Failed
            transaction.status = 'failed';
            transaction.description = `Card Failed: ${data.message} (Code: ${statusCode})`;
            await transaction.save();
        }

        res.status(200).json({ status: 'confirmed' });

    } catch (error) {
        console.error('Card Callback Error:', error);
        res.status(500).send('Error');
    }
};
