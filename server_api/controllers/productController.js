const Product = require('../models/Product');

const escapeRegex = require('../utils/escapeRegex');

// Get all products (with optional search)
exports.getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            const safeSearch = escapeRegex(search);
            query.name = { $regex: safeSearch, $options: 'i' }; // Safe case-insensitive match
        }

        const products = await Product.find(query).lean();
        res.json(products);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (_err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Create product (Admin)
exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', error: err.message });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update product (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete product (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
