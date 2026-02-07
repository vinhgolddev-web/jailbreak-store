const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Vehicle, Skin, Safe
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    description: { type: String },
    stock: { type: Number, default: 1, min: 0 },
    rarity: { type: String, enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Godly'], default: 'Common' },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

// Index for Shop Filtering
ProductSchema.index({ category: 1, price: 1 }); // For filtering by category and sorting by price
ProductSchema.index({ name: 1 });
ProductSchema.index({ rarity: 1 }); // For filtering by rarity

module.exports = mongoose.model('Product', ProductSchema);
