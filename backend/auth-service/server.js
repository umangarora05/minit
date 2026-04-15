// ========================================================================
// auth-service/server.js — Auth Microservice
// ========================================================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Note: Ensure these paths point to the 'src' folder you created
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ── Routes ───────────────────────────────────────────────────────────────
// Only Auth routes stay here
app.use('/api/auth',  require('./src/routes/authRoutes'));

app.get('/', (req, res) => res.send('MINIT Auth Service is running...'));

// ── Database & Cache ──────────────────────────────────────────────────────
connectDB();
connectRedis(); 

// ── Kafka (Optional for Auth) ─────────────────────────────────────────────
// If your Auth service doesn't need to listen to events, 
// you can remove the Kafka consumer logic entirely from this file.
// If you need it for "User Created" events, keep only the relevant part.

// ── Start HTTP server ──────────────────────────────────────────────────────
// Use the AUTH_PORT from your .env (e.g., 5001)
const PORT = process.env.AUTH_PORT || 5001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));