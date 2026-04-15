// ========================================================================
// MODULE 4: MongoDB — Documents, Collections, Schemas with Mongoose
// ========================================================================
// Topics: MongoDB CRUD, Documents, Collections, Mongoose Schema/Model
// ========================================================================

const mongoose = require('mongoose');  // Mongoose ODM
const bcrypt = require('bcryptjs');    // bcrypt — for hashing passwords

// --- SCHEMA: Defines the structure of a DOCUMENT in a COLLECTION ---
// A Document = one record (like a row in SQL)
// A Collection = group of documents (like a table in SQL)
// This schema creates a "users" collection in MongoDB
const userSchema = mongoose.Schema({
    name:     { type: String, required: true },                // user's name (required)
    email:    { type: String, required: true, unique: true },  // unique email
    password: { type: String, required: true },                // hashed password
    role:     {
        type: String,
        enum: ['student', 'vendor', 'delivery', 'admin'], // only these values allowed
        default: 'student'                                  // default role
    }
}, { timestamps: true }); // timestamps: auto adds createdAt & updatedAt fields

// --- MIDDLEWARE (Mongoose pre-save hook) ---
// Runs BEFORE saving a document. Used here to hash the password.
userSchema.pre('save', async function (next) {
    // Only hash if password was changed (not on every save)
    if (!this.isModified('password')) {
        next(); // skip hashing, move to save
    }
    const salt = await bcrypt.genSalt(10);                // generate salt (10 rounds)
    this.password = await bcrypt.hash(this.password, salt); // hash the password
});

// --- INSTANCE METHOD: Compare entered password with stored hash ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- MODEL: Mongoose model = JavaScript class for interacting with the collection ---
// mongoose.model('User', schema) → creates "users" collection in MongoDB
module.exports = mongoose.model('User', userSchema);
