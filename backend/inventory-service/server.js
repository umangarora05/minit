// ========================================================================
// inventory-service/server.js — Product & Stock Microservice
// ========================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectKafka, consumeEvent, TOPICS } = require('./src/config/kafka');

// Model and Controller imports
const productRoutes = require('./src/routes/productRoutes');
const inventoryConsumer = require('./src/kafka/consumers/inventoryConsumer');
const { connectRedis } = require('./src/config/redis');

const app = express();

// ── Standard Middleware ──────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// ── Database Connection ──────────────────────────────────────────────────
connectDB();
connectRedis();

// ── HTTP Routes ──────────────────────────────────────────────────────────
// Handles: GET /api/products, POST /api/products (Admin), etc.
app.use('/api/products', productRoutes);

app.get('/', (req, res) => res.send('📦 MINIT Inventory Service is operational...'));

// ── Kafka Event Consumer ─────────────────────────────────────────────────
// This logic triggers when an order is created to "lock" or deduct stock
connectKafka().then(() => {
    console.log('  Inventory Service Kafka Producer Ready');
    
    // Listening for 'order_created' to verify stock availability
    consumeEvent(TOPICS.ORDER_CREATED, 'inventory-group', inventoryConsumer, { maxRetries: 3 });
}).catch(err => {
    console.error('  Kafka Initialization Failed:', err.message);
});

// ── Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.INVENTORY_PORT || 5003;
app.listen(PORT, () => {
    console.log(`📦 Inventory Service running on port ${PORT}`);
});