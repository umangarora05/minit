// ========================================================================
// MODULE 4: MongoDB — Connecting with Mongoose (Node.js Driver)
// ========================================================================
// Topics: NoSQL Database, MongoDB Basics, Installation, MongoDB Node.js
//         Driver using Mongoose, Database connection
// ========================================================================

const mongoose = require('mongoose'); // Mongoose = ODM (Object Data Modeling) library for MongoDB

// --- Async function to connect to MongoDB ---
// Uses async/await (Module 1: JavaScript async/await)
const connectDB = async () => {
    try {
        // mongoose.connect() returns a promise
        // MONGO_URI format: mongodb://localhost:27017/minit
        //   - localhost:27017 = where MongoDB is running
        //   - /minit = the DATABASE name (auto-created if doesn't exist)
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If connection fails, log error and exit
        console.error(`Error: ${error.message}`);
        process.exit(1); // exit with failure code
    }
};

module.exports = connectDB; // export so server.js can use it
