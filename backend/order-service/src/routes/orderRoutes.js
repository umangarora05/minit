// ========================================================================
// MODULE 3: Express Router — Order Routes
// ========================================================================
// Topics: Express Router, Middleware chaining, Role-based Authorization
// ========================================================================

const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, updateOrderStatus, getMyOrders, getOrders, getVendorSales } = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// POST /api/orders — student places order | GET /api/orders — admin views all
router.route('/')
    .post(protect, restrictTo('student'), addOrderItems)
    .get(protect, restrictTo('admin', 'vendor', 'delivery'), getOrders);

// GET /api/orders/myorders — student's own orders
router.route('/myorders').get(protect, restrictTo('student'), getMyOrders);

// GET /api/orders/vendor-sales — vendor sales stats for dashboard
router.route('/vendor-sales').get(protect, restrictTo('vendor'), getVendorSales);

// GET /api/orders/:id — view single order
router.route('/:id').get(protect, getOrderById);

// PUT /api/orders/:id/status — update order status (delivery/admin/vendor)
router.route('/:id/status').put(protect, restrictTo('admin', 'vendor', 'delivery'), updateOrderStatus);

module.exports = router;
