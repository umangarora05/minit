// ========================================================================
// MODULE 3: Express Router — Product Routes (RESTful API)
// ========================================================================
// Topics: REST API, Middleware chaining, Role-based access
// ========================================================================

const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductStock } = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Route chaining: same path, different HTTP methods
router.route('/')
    .get(getProducts)                                          // Public: anyone can view products
    .post(protect, restrictTo('vendor', 'admin'), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, restrictTo('vendor', 'admin'), updateProduct)
    .delete(protect, restrictTo('vendor', 'admin'), deleteProduct);

// GET /api/products/:id/stock — real-time stock check (Redis-cached)
router.route('/:id/stock').get(getProductStock);

module.exports = router;
