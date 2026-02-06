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

        const partnerId = process.env.TSR_PARTNER_ID || '1234567890'; // Default for testing
        const partnerKey = process.env.TSR_PARTNER_KEY || '8d30d12543e3f4628f8885c575727145'; // Default for testing

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

        console.log('Sending to TSR:', payload);

        const response = await axios.post('https://thesieure.com/chargingws/v2', payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const data = response.data;
        console.log('TSR Response:', data);

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

// Optional: Callback/Webhook Handler (If TSR supports it and you configured it)
exports.handleCallback = async (req, res) => {
    // Implement if TSR calls back to a URL
    // Validate signature and update Transaction -> Success -> User Balance
    res.status(200).send('OK');
};
