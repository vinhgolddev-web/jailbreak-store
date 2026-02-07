const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['deposit', 'purchase', 'refund', 'adjustment'],
        required: true
    },
    amount: { type: Number, required: true }, // Positive for add, negative for deduct
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, default: '' },
    method: { type: String, default: 'system' }, // e.g. 'stripe', 'payos', 'manual'
    orderCode: { type: String }, // Changed to String for safety
    status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

// Index for performance
TransactionSchema.index({ userId: 1, createdAt: -1 }); // Compound index for efficient user history retrieval
TransactionSchema.index({ orderCode: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
