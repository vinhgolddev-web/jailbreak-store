const crypto = require('crypto');

/**
 * Perform a weighted random selection using CSPRNG
 * @param {Array} items - List of items with 'probability' field
 * @returns {Object} Selected item
 */
const calculateRoll = (items) => {
    if (!items || items.length === 0) return null;

    // Calculate total weight (handle float precision)
    const totalWeight = items.reduce((sum, item) => sum + (item.probability * 100), 0); // Scale up to avoid float issues

    // Generate secure random number between 0 and totalWeight
    const random = crypto.randomInt(0, Math.floor(totalWeight));

    let currentWeight = 0;
    for (const item of items) {
        currentWeight += (item.probability * 100);
        if (random < currentWeight) {
            return item;
        }
    }

    return items[items.length - 1]; // Fallback
};

module.exports = calculateRoll;
