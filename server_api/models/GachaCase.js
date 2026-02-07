const mongoose = require('mongoose');

const GachaCaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    items: [{
        name: { type: String, required: true },
        image: { type: String, required: true },
        rarity: {
            type: String,
            enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'HyperChrome', 'Godly', 'Secret'],
            default: 'Common'
        },
        probability: { type: Number, required: true } // Percentage (0-100)
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GachaCase', GachaCaseSchema);
