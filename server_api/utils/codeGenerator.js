const crypto = require('crypto');

const generateUniqueCode = async (Model, fieldName = 'code', length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let isUnique = false;
    let code = '';

    // Safety break to prevent infinite loops (extremely unlikely)
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        code = '';
        // Use crypto for better randomness
        for (let i = 0; i < length; i++) {
            code += chars.charAt(crypto.randomInt(0, chars.length));
        }

        // Check if code exists in DB
        const exists = await Model.findOne({ [fieldName]: code });
        if (!exists) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate unique code after multiple attempts');
    }

    return code;
};

module.exports = generateUniqueCode;
