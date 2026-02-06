const payos = require('../lib/payos');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Create Payment Link
exports.createPaymentLink = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user.id;

        if (!amount || amount < 2000) {
            return res.status(400).json({ message: 'Amount must be at least 2000 VND' });
        }

        // Generate unique orderCode (Safe integer)
        const orderCode = Number(Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000));

        const body = {
            orderCode: orderCode,
            amount: amount,
            description: description || `Nap tien ${orderCode}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/deposit?status=cancelled`,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/deposit?status=success&orderCode=${orderCode}`
        };

        const paymentLinkResponse = await payos.createPaymentLink(body);

        // Create Pending Transaction
        const user = await User.findById(userId);

        await Transaction.create({
            userId: userId,
            type: 'deposit',
            amount: amount,
            balanceBefore: user.balance,
            balanceAfter: user.balance, // Not updated yet
            description: `PayOS Deposit Pending #${orderCode}`,
            method: 'payos',
            orderCode: orderCode
        });

        res.json({ checkoutUrl: paymentLinkResponse.checkoutUrl, orderCode: orderCode });

    } catch (error) {
        console.error('PayOS Create Error:', error);
        res.status(500).json({ message: 'Error creating payment link', error: error.message });
    }
};

// Webhook Handler
exports.handleWebhook = async (req, res) => {
    try {
        const webhookData = payos.verifyPaymentWebhookData(req.body);

        if (webhookData.desc === 'success' || webhookData.code == '00') {
            const { orderCode, amount } = webhookData;

            // Find Transaction
            const transaction = await Transaction.findOne({ orderCode: orderCode, type: 'deposit' });
            if (!transaction) {
                return res.json({ message: 'Transaction not found or already processed' });
            }

            // Check if already processed
            if (transaction.description.includes('Success')) {
                return res.json({ message: 'Already processed' });
            }

            // Update User Balance
            const user = await User.findById(transaction.userId);
            const newBalance = user.balance + amount;

            await User.findByIdAndUpdate(user._id, { balance: newBalance });

            // Update Transaction
            transaction.balanceAfter = newBalance;
            transaction.description = `PayOS Deposit Success #${orderCode}`;
            await transaction.save();
        }

        res.json({ message: 'Webhook received' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.json({ message: 'Webhook failed' });
    }
};

// Verify Payment Status (Called from frontend after return from PayOS)
exports.verifyPayment = async (req, res) => {
    try {
        const { orderCode } = req.params;

        // Get payment info from PayOS
        const paymentInfo = await payos.getPaymentLinkInformation(Number(orderCode));

        if (!paymentInfo) {
            return res.status(404).json({ message: 'Payment not found on PayOS' });
        }

        // Find transaction
        const transaction = await Transaction.findOne({ orderCode: Number(orderCode), type: 'deposit' });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found in database' });
        }

        // Check if already processed
        if (transaction.description.includes('Success')) {
            return res.json({
                message: 'Already processed',
                status: 'success',
                balance: transaction.balanceAfter
            });
        }

        // SECURITY CHECK: Ensure the user verifying is the owner of transaction
        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: Transaction belongs to another user' });
        }

        // SECURITY CHECK: Verify amount matches
        if (paymentInfo.amount !== transaction.amount) {
            return res.status(400).json({ message: 'Amount mismatch: Potential integrity issue' });
        }

        // Check payment status from PayOS
        if (paymentInfo.status === 'PAID') {
            // Update user balance
            const user = await User.findById(transaction.userId);
            const newBalance = user.balance + transaction.amount;

            await User.findByIdAndUpdate(user._id, { balance: newBalance });

            // Update transaction
            transaction.balanceAfter = newBalance;
            transaction.description = `PayOS Deposit Success #${orderCode}`;
            await transaction.save();

            return res.json({
                message: 'Payment verified and credited',
                status: 'success',
                amount: transaction.amount,
                newBalance: newBalance
            });
        } else {
            return res.json({
                message: 'Payment not completed yet',
                status: paymentInfo.status
            });
        }

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};
