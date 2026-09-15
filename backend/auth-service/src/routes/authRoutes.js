// ========================================================================
// MODULE 3: Node.js — Express Router for Auth Routes
// ========================================================================
// Topics: Express Router, REST API endpoints, Form Handling
// ========================================================================

const express = require('express');
const { registerUser, loginUser, resetPassword, sendOtp } = require('../controllers/authController');

const router = express.Router(); // create a mini-router

// POST /api/auth/send-otp - send otp to email
router.post('/send-otp', sendOtp);

// POST /api/auth/register — handles registration form submission
router.post('/register', registerUser);

// POST /api/auth/login — handles login form submission
router.post('/login', loginUser);

// PUT /api/auth/reset-password — handles direct password reset
router.put('/reset-password', resetPassword);

module.exports = router; // export to be mounted in server.js
