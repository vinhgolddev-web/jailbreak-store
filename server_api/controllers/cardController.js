const axios = require('axios');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// --- Helper: Generate MD5 Signature ---
// Formula: MD5(partner_key + code + command + partner_id + request_id + serial + telco)
const createSignature = (partnerKey, code, command, partnerId, requestId, serial, telco) => {
    const rawString = `${partnerKey}${code}${command}${partnerId}${requestId}${serial}${telco}`;
    return crypto.createHash('md5').update(rawString).digest('hex');
};

exports.submitCard = async (req, res) => {
    try {
        const { telco, code, serial, amount } = req.body;

        // 1. Validation
        if (!telco || !code || !serial || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const partnerId = process.env.TSR_PARTNER_ID;
        const partnerKey = process.env.TSR_PARTNER_KEY;

        if (!partnerId || !partnerKey) {
            console.error('TSR Config Missing');
            return res.status(500).json({ message: 'Service configuration error' });
        }

        // 2. Prepare Data
        const command = 'charging';
        // Generate numeric ID: Timestamp (13 chars) + Random (3 chars) -> 16 chars (Safe for JS Number)
        const requestId = parseInt(`${Date.now()}${Math.floor(Math.random() * 1000)}`);

        // Ensure Telco is uppercase
        const normalizedTelco = telco.toUpperCase();

        // 3. Generate Signature
        const signature = createSignature(
            partnerKey,
            code,
            command,
            partnerId,
            requestId,
            serial,
            normalizedTelco
        );

        // 4. Create Pending Transaction Log
        const transaction = await Transaction.create({
            userId: req.user.id,
            type: 'deposit',
            method: 'card',
            amount: Number(amount), // Note: TSR might return different real value
            balanceBefore: 0, // Will update when confirmed
            balanceAfter: 0,
            description: `Card Deposit: ${normalizedTelco} ${Number(amount).toLocaleString()}đ - Pending`,
            orderCode: requestId, // Check if Number or String in schema
            status: 'pending'
        });

        // 5. Send Request to Thesieure
        const payload = {
            telco: normalizedTelco,
            code,
            serial,
            amount,
            partner_id: partnerId,
            sign: signature,
            command,
            request_id: requestId
        };



        const response = await axios.post('https://thesieure.com/chargingws/v2', payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const data = response.data;


        // 6. Handle Response
        // Status 99: Pending (Good)
        // Status 1: Success (Rare for immediate)
        // Status 2, 3, 4: Errors

        if (data.status === 99 || data.status === 1) {
            return res.json({
                message: 'Card submitted successfully. Please wait for processing.',
                status: 'pending',
                requestId
            });
        } else {
            // Failed
            await Transaction.findByIdAndUpdate(transaction._id, {
                status: 'failed',
                description: `Card Failed: ${data.message || 'Unknown error'}`
            });
            return res.status(400).json({
                message: data.message || 'Card submission failed',
                code: data.status
            });
        }

    } catch (error) {
        console.error('Card Submit Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Callback/Webhook Handler from Thesieure
exports.handleCallback = async (req, res) => {
    try {
        const { status, message, request_id, trans_id, declared_value, value, amount, code, serial, telco, callback_sign } = req.body;

        const partnerKey = process.env.TSR_PARTNER_KEY;

        // 1. Validate Signature
        // Formula: MD5(partner_key + code + serial)
        const rawSignature = `${partnerKey}${code}${serial}`;
        const mySignature = crypto.createHash('md5').update(rawSignature).digest('hex');

        if (mySignature !== callback_sign) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        // 2. Find Transaction
        const transaction = await Transaction.findOne({ orderCode: request_id, type: 'deposit', method: 'card' });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'completed') {
            return res.json({ message: 'Already completed' });
        }

        // 3. Handle Status
        // Status 1: Success
        // Status 2: Incorrect logic (Wrong card type/amount?) -> Failed
        // Status 99: Pending
        // Other: Fail

        if (status == 1) {
            // SUCCESS
            // Use declared_value or value? "value" is the real value received.
            const realAmount = Number(value);

            // Atomic Lock & Update
            const updatedTx = await Transaction.findOneAndUpdate(
                { _id: transaction._id, status: 'pending' },
                {
                    status: 'completed',
                    amount: realAmount, // Update to actual received amount
                    balanceAfter: transaction.balanceBefore + realAmount, // Approximate, will fix in User update
                    description: `Card Deposit Success: ${telco} ${realAmount.toLocaleString()}đ`
                },
                { new: true }
            );

            if (updatedTx) {
                // Credit User
                const user = await User.findByIdAndUpdate(
                    transaction.userId,
                    { $inc: { balance: realAmount } },
                    { new: true }
                );

                // Update final balance log
                updatedTx.balanceAfter = user.balance;
                await updatedTx.save();
            }

        } else if (status == 2 || status == 3 || status == 4) {
            // FAILED
            await Transaction.findOneAndUpdate(
                { _id: transaction._id, status: 'pending' },
                {
                    status: 'failed',
                    description: `Card Failed: ${message || 'Unknown error'}`
                }
            );
        }

        res.status(200).json({ message: 'Callback received' });

    } catch (error) {
        console.error('Card Callback Error:', error);
        res.status(500).json({ message: 'Internal error' });
    }
};
