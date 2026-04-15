// ========================================================================
// delivery-service/server.js — Fulfillment Microservice
// ========================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectKafka, consumeEvent, TOPICS } = require('./src/config/kafka');
const deliveryConsumer = require('./src/kafka/consumers/deliveryConsumer');
const deliveryRoutes = require('./src/routes/deliveryRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// ── Database Connection ──────────────────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────────────────
// Used for tracking updates and rider status
app.use('/api/delivery', deliveryRoutes);

app.get('/', (req, res) => res.send('🚚 MINIT Delivery Service is active...'));

// ── Kafka Event Consumer ─────────────────────────────────────────────────
// This service starts working once a payment is confirmed
connectKafka().then(() => {
    console.log('  Delivery Service Kafka Producer Ready');
    
    // Subscribe to PAYMENT_COMPLETED to trigger delivery assignment
    consumeEvent(TOPICS.PAYMENT_COMPLETED, 'delivery-group', deliveryConsumer, { maxRetries: 3 });
}).catch(err => {
    console.error('  Kafka Initialization Failed:', err.message);
});

// ── Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.DELIVERY_PORT || 5004;
app.listen(PORT, () => {
    console.log(`📦 Delivery Service running on port ${PORT}`);
});