// ========================================================================
// MODULE 3: Node.js — Form Handling, Sending Client Data to Server
// MODULE 3: Authentication and Authorization (JWT)
// ========================================================================
// Topics: Form Handling with Express, Request/Response Objects,
//         Sending Client Data to Server, JSON, Async/Await
// ========================================================================

const User = require('../models/User');       // Mongoose User model (Module 4)
const jwt = require('jsonwebtoken');           // JSON Web Token library

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
// REGISTER — Create a new user (Form Handling with Express)
// POST /api/auth/register
// ========================================================================
const registerUser = async (req, res) => {
    // req.body contains data sent from the client (parsed by express.json() middleware)
    // This is how FORM DATA arrives at the server
    const { name, email, password, role } = req.body; // destructure form fields

    try {
        // MongoDB QUERY: Check if user already exists
        const userExists = await User.findOne({ email }); // findOne = MongoDB query
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // MongoDB CREATE: Insert a new document into the users collection
        const user = await User.create({ name, email, password, role });

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

module.exports = { registerUser, loginUser };
