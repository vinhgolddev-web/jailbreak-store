const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 },
        priceAtPurchase: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    secretCode: { type: String } // 10-digit code for digital delivery
}, { timestamps: true });

// Indexes for performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ 'items.productId': 1 });
OrderSchema.index({ status: 1, createdAt: -1 }); // For recent public orders dashboard

module.exports = mongoose.model('Order', OrderSchema);
