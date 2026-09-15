// ========================================================================
// MODULE 3: Node.js — Form Handling, Sending Client Data to Server
// MODULE 3: Authentication and Authorization (JWT)
// ========================================================================
// Topics: Form Handling with Express, Request/Response Objects,
//         Sending Client Data to Server, JSON, Async/Await
// ========================================================================

const User = require('../models/User');       // Mongoose User model (Module 4)
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');           // JSON Web Token library
const sendEmail = require('../utils/emailService');

// ========================================================================
// REGEX PATTERNS — Server-side validation (Module 1: Regular Expressions)
// ========================================================================
// Email regex: validates proper email format
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Password regex: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// --- Helper: Generate a JWT token ---
// JWT = JSON Web Token = a signed string containing user info
// Used instead of sessions/cookies for stateless authentication
const generateToken = (id) => {
    // jwt.sign(payload, secret, options)
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // token expires in 30 days
    });
};

// ========================================================================
// SEND OTP
// POST /api/auth/send-otp
// ========================================================================
const sendOtp = async (req, res) => {
    const { email, newPassword, forRegistration } = req.body;
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        // Registration flow: check if email is already taken
        if (forRegistration) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'This email is already registered. Please sign in or use a different email.' });
            }
        }

        // Password reset flow: check user exists + same password
        if (newPassword) {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'No account found with that email address' });
            }
            const isSamePassword = await user.matchPassword(newPassword);
            if (isSamePassword) {
                return res.status(400).json({ message: 'New password cannot be the same as your current password.' });
            }
        }

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save or update OTP in DB
        await OTP.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send email
        await sendEmail({
            email,
            subject: 'Your OTP Code',
            message: `Your OTP code is ${otpCode}. It is valid for 10 minutes.`
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========================================================================
// REGISTER — Create a new user (Form Handling with Express)
// POST /api/auth/register
// ========================================================================
const registerUser = async (req, res) => {
    // req.body contains data sent from the client (parsed by express.json() middleware)
    // This is how FORM DATA arrives at the server
    const { name, email, password, role, otp } = req.body; // destructure form fields

    // --- SERVER-SIDE REGEX VALIDATION ---
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Invalid email format. Please provide a valid email (e.g., name@gmail.com)' });
    }
    if (!password || !PASSWORD_REGEX.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&)' });
    }
    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }

    try {
        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // MongoDB QUERY: Check if user already exists
        const userExists = await User.findOne({ email }); // findOne = MongoDB query
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // MongoDB CREATE: Insert a new document into the users collection
        const user = await User.create({ name, email, password, role });
        
        // Remove OTP record
        await OTP.deleteOne({ email });

        // Send back JSON response with user info + token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // generate JWT for auto-login
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========================================================================
// LOGIN — Authenticate a user
// POST /api/auth/login
// ========================================================================
const loginUser = async (req, res) => {
    const { email, password } = req.body; // get login form data

    // --- SERVER-SIDE REGEX VALIDATION (email only — no password regex on login) ---
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Invalid email format. Please provide a valid email (e.g., name@gmail.com)' });
    }

    try {
        // MongoDB QUERY: Find user by email
        const user = await User.findOne({ email });

        // Check if user exists AND password matches (bcrypt compare)
        if (user && (await user.matchPassword(password))) {
            //   Success — send user data + JWT token
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            //   Invalid credentials
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========================================================================
// RESET PASSWORD — Change password directly (no OTP/email verification)
// PUT /api/auth/reset-password
// ========================================================================
const resetPassword = async (req, res) => {
    const { email, newPassword, otp } = req.body;

    // --- SERVER-SIDE REGEX VALIDATION ---
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Invalid email format. Please provide a valid email (e.g., name@gmail.com)' });
    }
    if (!newPassword || !PASSWORD_REGEX.test(newPassword)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&)' });
    }
    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }

    try {
        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // MongoDB QUERY: Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email address' });
        }

        // Check if new password is the same as the current password
        const isSamePassword = await user.matchPassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password cannot be the same as your current password.' });
        }

        // Update password — bcrypt hashing happens automatically via Mongoose pre-save hook
        user.password = newPassword;
        await user.save();

        // Remove OTP record
        await OTP.deleteOne({ email });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, resetPassword, sendOtp };
