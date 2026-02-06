const axios = require('axios');
const crypto = require('crypto');

const PARTNER_ID = process.env.TSR_PARTNER_ID;
const PARTNER_KEY = process.env.TSR_PARTNER_KEY;
const API_URL = 'https://thesieure.com/chargingws/v2';

/**
 * Generate MD5 Signature
 * Formula: MD5(partner_id + code + command + partner_key + request_id + serial + telco)
 */
function generateSignature(code, serial, telco, requestId) {
    const command = 'charging';
    const rawString = `${PARTNER_ID}${code}${command}${PARTNER_KEY}${requestId}${serial}${telco}`;
    return crypto.createHash('md5').update(rawString).digest('hex');
}

/**
 * Submit Card to Provider
 * @param {string} telco - VIETTEL, VINAPHONE, MOBIFONE, etc.
 * @param {string} code - Card Code
 * @param {string} serial - Card Serial
 * @param {number} amount - Card Amount (Optional but recommended)
 * @param {string} requestId - Unique Request ID
 */
exports.submitCard = async (telco, code, serial, amount, requestId) => {
    try {
        if (!PARTNER_ID || !PARTNER_KEY) {
            throw new Error('Card Provider config missing');
        }

        const signature = generateSignature(code, serial, telco, requestId);

        const payload = {
            telco,
            code,
            serial,
            amount,
            request_id: requestId,
            partner_id: PARTNER_ID,
            command: 'charging',
            sign: signature
        };

        const response = await axios.post(API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Provider response structure usually: { status: 1|99|err, message: "..." }
        return response.data;

    } catch (error) {
        console.error('Card Submission Error:', error.message);
        throw error; // Let controller handle
    }
};
