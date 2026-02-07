const mongoose = require('mongoose');

const SecretItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    rarity: { type: String, default: 'Godly' },
    probability: { type: Number, default: 0 }, // Weighted chance
    active: { type: Boolean, default: true }, // To easily enable/disable items
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SecretItem', SecretItemSchema);
