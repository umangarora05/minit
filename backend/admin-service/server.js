// ========================================================================
// admin-service/server.js — Admin Microservice
// ========================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// ── Standard Middleware ──────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ── Database & Cache Connections ─────────────────────────────────────────
// Each service maintains its own connection pool
connectDB();
connectRedis();

// ── Routes ───────────────────────────────────────────────────────────────
// Note: Prefixing with /api/admin to match your frontend expectations
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('MINIT Admin Service is operational...');
});

// ── Error Handling ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(`[Admin Service Error]: ${err.message}`);
    res.status(500).json({ message: 'Internal Admin Service Error' });
});

// ── Start Server ─────────────────────────────────────────────────────────
// Using Port 5006 as we discussed to avoid clashing with Auth (5001)
const PORT = process.env.ADMIN_PORT || 5006;
app.listen(PORT, () => {
    console.log(`👑 Admin Service running on port ${PORT}`);
});