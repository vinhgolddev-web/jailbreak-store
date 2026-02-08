const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0, min: 0 },
    totalDeposited: { type: Number, default: 0, min: 0 },
    role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
    facebookLink: { type: String, default: '' },
    avatar: { type: String, default: '' },
    cart: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true });

UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
