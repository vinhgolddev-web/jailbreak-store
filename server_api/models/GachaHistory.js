const mongoose = require('mongoose');

const GachaHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'GachaCase', required: true },
    caseName: { type: String, required: true }, // Snapshot in case Case is deleted
    itemName: { type: String, required: true },
    itemImage: { type: String, required: true },
    rarity: { type: String, required: true },
    isSecret: { type: Boolean, default: false },
    secretCode: { type: String, default: null }, // Unique code for secret items
    pricePaid: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

GachaHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GachaHistory', GachaHistorySchema);
