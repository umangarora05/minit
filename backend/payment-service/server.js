// ========================================================================
// payment-service/server.js — Transaction Microservice
// ========================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectKafka, consumeEvent, TOPICS } = require('./src/config/kafka');

// Consumer import
const paymentConsumer = require('./src/kafka/consumers/paymentConsumer');

const app = express();
app.use(express.json());
app.use(cors());

// ── Database Connection ──────────────────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────────────────
// Payments are usually triggered by Kafka, but you might need a Webhook route
// app.use('/api/payments/webhook', require('./src/routes/paymentRoutes'));

app.get('/', (req, res) => res.send('💳 MINIT Payment Service is operational...'));

// ── Kafka Event Consumer ─────────────────────────────────────────────────
// This service starts working ONLY after inventory is confirmed
connectKafka().then(() => {
    console.log('  Payment Service Kafka Producer Ready');
    
    // Subscribe to INVENTORY_CHECKED to trigger the payment process
    consumeEvent(TOPICS.INVENTORY_CHECKED, 'payment-group', paymentConsumer, { maxRetries: 3 });
}).catch(err => {
    console.error('  Kafka Initialization Failed:', err.message);
});

// ── Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.PAYMENT_PORT || 5005;
app.listen(PORT, () => {
    console.log(`💳 Payment Service running on port ${PORT}`);
});