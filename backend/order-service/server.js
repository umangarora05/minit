// ========================================================================
// order-service/server.js — Order Lifecycle Microservice
// ========================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectKafka, consumeEvent, TOPICS } = require('./src/config/kafka');

const orderRoutes = require('./src/routes/orderRoutes');
const orderStatusConsumer = require('./src/kafka/consumers/orderConsumer');
const { connectRedis } = require('./src/config/redis');

const app = express();
app.use(express.json());
app.use(cors());

// ── Database ─────────────────────────────────────────────────────────────
connectDB();
connectRedis();

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.send('🛒 MINIT Order Service is running...'));

// ── Kafka Consumer ───────────────────────────────────────────────────────
// This consumer is the SOLE writer for order status changes.
// It listens for: 'order_status_update' (emitted by Payment or Delivery)
connectKafka().then(() => {
    console.log('  Order Service Kafka Producer Ready');
    
    consumeEvent(
        TOPICS.ORDER_STATUS_UPDATE, 
        'order-state-group', 
        orderStatusConsumer, 
        { maxRetries: 5 }
    );
});

const PORT = process.env.ORDER_PORT || 5002;
app.listen(PORT, () => console.log(`🛒 Order Service on port ${PORT}`));