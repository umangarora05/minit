// ========================================================================
// MODULE 4: MongoDB — Product Schema (Documents & Collections)
// ========================================================================

const mongoose = require('mongoose');

// --- Product Schema ---
// Each product is a DOCUMENT in the "products" COLLECTION
const productSchema = mongoose.Schema({
    // ObjectId reference — links this product to a user (the vendor who created it)
    vendor:      { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name:        { type: String, required: true },   // product name
    description: { type: String, required: true },   // product description
    price:       { type: Number, required: true },   // price in currency
    stock:       { type: Number, required: true, default: 0 }, // available stock
    category:    { type: String, required: true },   // category tag
    image:       { type: String, required: false },  // optional image URL
}, { timestamps: true }); // auto createdAt, updatedAt

// Export the model → creates "products" collection
module.exports = mongoose.model('Product', productSchema);
