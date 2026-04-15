// ========================================================================
// MODULE 3: Node.js — Middleware Function Calls
// ========================================================================
// Topics: Middleware, Authentication & Authorization, Cookies and Sessions
// ========================================================================
// Middleware = function with (req, res, next)
// - Runs BETWEEN the request arriving and the route handler executing
// - Must call next() to pass control to the next middleware/handler
// - Used for: auth checks, logging, parsing, error handling, etc.
// ========================================================================

const jwt = require('jsonwebtoken'); // JWT for token-based authentication
const User = require('../models/User');

// --- PROTECT middleware: checks if user is logged in ---
// This replaces session/cookie auth with JWT token auth (stateless)
const protect = async (req, res, next) => {
    let token;

    // Check for token in the Authorization header: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from "Bearer abc123..."
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user object to req (minus password) for use in route handlers
            req.user = await User.findById(decoded.id).select('-password');

            next(); //   token valid — continue to the route handler
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // No token found
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
};

// --- RESTRICT TO middleware: Authorization (role-based access) ---
// Only allows users with specific roles to access a route
// Uses a CLOSURE — returns a new middleware function with the roles baked in
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user was set by the protect middleware above
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to access this route' });
        }
        next(); //   user has the right role — continue
    };
};

module.exports = { protect, restrictTo };
