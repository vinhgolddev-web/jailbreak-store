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

            // Atomic Update to prevent race condition with verifyPayment
            const transaction = await Transaction.findOneAndUpdate(
                {
                    orderCode: orderCode,
                    type: 'deposit',
                    description: { $not: /Success/ } // Only proceed if NOT already success
                },
                {
                    $set: { description: `PayOS Deposit Success #${orderCode}` }
                },
                { new: true }
            );

            if (!transaction) {
                return res.json({ message: 'Transaction not found or already processed' });
            }

            // Update User Balance
            // Calculate new balance based on current + amount
            const user = await User.findByIdAndUpdate(
                transaction.userId,
                { $inc: { balance: amount } },
                { new: true }
            );

            // Backfill balance after (Optional, for record)
            if (user) {
                transaction.balanceAfter = user.balance;
                await transaction.save();
            }
        }

        res.json({ message: 'Webhook received' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.json({ message: 'Webhook failed' });
    }
};

// Verify Payment Status (Atomic & Secure)
exports.verifyPayment = async (req, res) => {
    try {
        const { orderCode } = req.params;

        // 1. Get payment info from PayOS (External Verification)
        const paymentInfo = await payos.getPaymentLinkInformation(Number(orderCode));

        if (!paymentInfo) {
            return res.status(404).json({ message: 'Payment not found on PayOS' });
        }

        // 2. Atomic Database Update
        // We look for a transaction that matches OrderCode AND is explicitly NOT 'completed' (or check status field)
        // If 'description' contains 'Success', we assume it's processed. Better: rely on 'balanceAfter' or add a 'status' field.
        // Since Schema didn't have 'status', we'll rely on a check + atomic lock. 
        // Ideally we migrate to add 'status' to Transaction model. For now, we use the constraint.

        const transaction = await Transaction.findOne({ orderCode: Number(orderCode), type: 'deposit' });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found or invalid' });
        }

        // SECURITY: Transaction Owner Check
        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized transaction' });
        }

        // Idempotency: If already success, return immediately
        if (transaction.description.includes('Success')) {
            return res.json({
                message: 'Already processed',
                status: 'success',
                balance: transaction.balanceAfter
            });
        }

        // 3. Verify Amount Match
        if (paymentInfo.amount !== transaction.amount) {
            return res.status(400).json({ message: 'Amount integrity violation' });
        }

        // 4. Process Payment (Atomic)
        if (paymentInfo.status === 'PAID') {

            // Start Session for Atomicity (Optional if Mongo Replica Set enabled, else use Atomic conditions)
            // Here we use atomic findOneAndUpdate on User validation.

            // To prevent race: We first mark transaction as 'processing' or check condition again in update.
            // Best approach without modifying Schema significantly:
            // Use findOneAndUpdate with condition filter.

            const updatedTransaction = await Transaction.findOneAndUpdate(
                {
                    _id: transaction._id,
                    description: { $not: /Success/ } // Only update if NOT already success
                },
                {
                    $set: { description: `PayOS Deposit Success #${orderCode}` }
                },
                { new: true }
            );

            if (!updatedTransaction) {
                // Determine why: Was it race condition?
                const check = await Transaction.findById(transaction._id);
                if (check.description.includes('Success')) {
                    return res.json({ message: 'Already processed (Race)', status: 'success', balance: check.balanceAfter });
                }
                throw new Error("Transaction update failed unexpectedly");
            }

            // Now Credit User (Safe to do because we own the Transaction Lock via the atomic update above)
            const user = await User.findByIdAndUpdate(
                transaction.userId,
                { $inc: { balance: transaction.amount } },
                { new: true }
            );

            // Backfill balance log
            updatedTransaction.balanceAfter = user.balance;
            await updatedTransaction.save();

            return res.json({
                message: 'Payment verified and credited',
                status: 'success',
                amount: transaction.amount,
                newBalance: user.balance
            });
        }

        return res.json({ message: 'Payment pending', status: paymentInfo.status });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Internal verification error', error: error.message });
    }
};
