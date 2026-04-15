// ========================================================================
// MODULE 4: MongoDB — Order Schema (Nested Documents / Sub-documents)
// ========================================================================

const mongoose = require('mongoose');

// --- Order Schema ---
// Demonstrates NESTED DOCUMENTS (orderItems array contains sub-documents)
const orderSchema = mongoose.Schema({
    // Reference to the user who placed the order
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

    // ARRAY of sub-documents — each item in the order
    orderItems: [
        {
            name:    { type: String, required: true },  // product name
            qty:     { type: Number, required: true },  // quantity ordered
            price:   { type: Number, required: true },  // price per item
            product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        }
    ],

    totalPrice: { type: Number, required: true, default: 0.0 },

    // Payment method — UPI, Debit Card, Credit Card, or Cash on Delivery
    paymentMethod: {
        type: String,
        required: true,
        default: 'cod',
        enum: ['upi', 'debit', 'credit', 'cod']
    },

    // Payment status
    paymentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'failed']
    },

    // Enum field — only specific string values are allowed
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
    },

    // ── Optimistic locking ──────────────────────────────────────────────
    // Incremented on every state-changing update. Consumers include the
    // current version in their query filter so that only ONE concurrent
    // writer succeeds; losers retry with the fresh version.
    version: { type: Number, default: 0 },

    // ── Persistent idempotency ──────────────────────────────────────────
    // Stores eventIds that have already been applied to this order.
    // The orderConsumer checks this array with $nin before updating.
    processedEvents: [{ type: String }],

}, { timestamps: true });

// Index for fast idempotency lookups
orderSchema.index({ processedEvents: 1 });

module.exports = mongoose.model('Order', orderSchema);
