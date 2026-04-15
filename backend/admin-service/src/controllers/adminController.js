const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const [totalUsers, totalProducts, totalVendors] = await Promise.all([
            User.countDocuments({}),
            Product.countDocuments({}),
            User.countDocuments({ role: 'vendor' })
        ]);

        // 2. Recent Entries
        const [recentUsers, recentProducts, recentVendors] = await Promise.all([
            User.find({}).sort({ createdAt: -1 }).limit(5).select('name email role'),
            Product.find({}).sort({ createdAt: -1 }).limit(5).select('name price'),
            User.find({ role: 'vendor' }).sort({ createdAt: -1 }).limit(5).select('name email')
        ]);

        // 3. User Growth (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const growthData = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Transform growthData to ensure all 7 days are represented
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const existing = growthData.find(item => item._id === dateStr);
            chartData.push({
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                users: existing ? existing.count : 0
            });
        }

        res.json({
            users: totalUsers,
            products: totalProducts,
            vendors: totalVendors,
            recentUsers,
            recentProducts,
            recentVendors,
            chartData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats };
