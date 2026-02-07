const mongoose = require('mongoose');

const GachaHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'GachaCase', required: true },
    caseName: { type: String, required: true }, // Snapshot in case Case is deleted
    itemName: { type: String, required: true },
    itemImage: { type: String, required: true },
    rarity: { type: String, required: true },
    isSecret: { type: Boolean, default: false },
    code: { type: String, required: true }, // Unified redemption code (8-char uppercase)
    pricePaid: { type: Number, required: true },
    status: { type: String, enum: ['unclaimed', 'claimed'], default: 'unclaimed' },
    createdAt: { type: Date, default: Date.now }
});

GachaHistorySchema.index({ userId: 1, createdAt: -1 }); // Compound index for user history
GachaHistorySchema.index({ rarity: 1 }); // For stats or rarity filtering
GachaHistorySchema.index({ code: 1 }, { unique: true }); // For Code Lookup Tool & Uniqueness

module.exports = mongoose.model('GachaHistory', GachaHistorySchema);
