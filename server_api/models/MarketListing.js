const mongoose = require('mongoose');

const MarketListingSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 2000 },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'sold', 'deleted'], default: 'active' },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

MarketListingSchema.index({ status: 1, createdAt: -1 }); // For fetching active listings
MarketListingSchema.index({ sellerId: 1 }); // For fetching seller's listings

module.exports = mongoose.model('MarketListing', MarketListingSchema);
