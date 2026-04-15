const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/admin/stats
// Protected by token auth and role-based check
router.get('/stats', protect, restrictTo('admin'), getAdminStats);

module.exports = router;
