const mongoose = require('mongoose');

const MarketListingSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 2000 },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'sold', 'deleted'], default: 'active' },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    code: { type: String }, // Transaction Code
    soldAt: { type: Date }
}, { timestamps: true });

MarketListingSchema.index({ status: 1, createdAt: -1 });
MarketListingSchema.index({ sellerId: 1 });
MarketListingSchema.index({ buyerId: 1 }); // For purchase history
MarketListingSchema.index({ code: 1 }, { unique: true, sparse: true }); // Ensure unique codes

module.exports = mongoose.model('MarketListing', MarketListingSchema);
