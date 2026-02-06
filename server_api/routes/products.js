const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin Routes
router.post('/', isAdmin, productController.createProduct);
router.put('/:id', isAdmin, productController.updateProduct);
router.delete('/:id', isAdmin, productController.deleteProduct);

module.exports = router;
