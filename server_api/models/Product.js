const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Vehicle, Skin, Safe
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String },
    stock: { type: Number, default: 1 },
    rarity: { type: String, enum: ['Thường', 'Hiếm', 'Siêu hiếm'], default: 'Thường' },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

// Index for Shop Filtering
ProductSchema.index({ category: 1 });

module.exports = mongoose.model('Product', ProductSchema);
