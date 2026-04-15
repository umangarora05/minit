const express = require('express');
const router = express.Router();
const { acceptDelivery, startDelivery, markDelivered } = require('../controllers/deliveryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// POST /api/delivery/:orderId/accept
router.route('/:orderId/accept')
    .post(protect, restrictTo('delivery'), acceptDelivery);

// POST /api/delivery/:orderId/start
router.route('/:orderId/start')
    .post(protect, restrictTo('delivery'), startDelivery);

// POST /api/delivery/:orderId/deliver
router.route('/:orderId/deliver')
    .post(protect, restrictTo('delivery'), markDelivered);

module.exports = router;
