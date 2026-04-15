// ========================================================================
// Kafka Consumer — Payment Service [CONCURRENCY-SAFE]
// ========================================================================
// Listens to: inventory_checked
// Emits on success: payment_completed + order_status_update
// Emits on failure: order_status_update (failed)
//
// Protections:
//   1. Persistent idempotency — ProcessedEvent collection (not in-memory)
//   2. Retry-safe             — errors are re-thrown for Kafka DLQ
//   3. eventId propagation    — every downstream event carries the eventId
// ========================================================================

const { produceEvent, TOPICS } = require('../../config/kafka');
const ProcessedEvent = require('../../models/ProcessedEvent');

const CONSUMER_NAME = 'payment';

const paymentHandler = async ({ parsedValue }) => {
    try {
        const { eventId, orderId, paymentMethod, totalPrice, userId, items } = parsedValue;

        // ── Validate input ──────────────────────────────────────────────
        if (!eventId || !orderId) {
            console.log('[Payment]   Invalid event received:', parsedValue);
            return;
        }

        // ── Persistent idempotency check ────────────────────────────────
        // Try to insert a record for this (eventId, consumer) pair.
        // If it already exists, the unique index throws a duplicate-key error.
        try {
            await ProcessedEvent.create({ eventId, consumer: CONSUMER_NAME });
        } catch (err) {
            if (err.code === 11000) {
                // Duplicate key — this event was already processed
                console.log(`[Payment] ⏭ Duplicate event ${eventId} — skipping`);
                return;
            }
            // Unexpected DB error — re-throw so Kafka retries
            throw err;
        }

        console.log(`[Payment] Processing payment for order ${orderId} via ${paymentMethod}`);

        // ── COD Flow ───────────────────────────────────────────────────
        if (paymentMethod === 'cod') {
            console.log(`[Payment] ℹ️ COD order ${orderId} — forwarding to delivery`);

            await produceEvent(TOPICS.PAYMENT_COMPLETED, {
                eventId,
                orderId,
                userId,
                items,
                paymentMethod,
                paymentStatus: 'pending',
            });

            return;
        }

        // ── Simulate Payment Gateway ───────────────────────────────────
        await new Promise(resolve => setTimeout(resolve, 1000));

        const paymentSucceeded = true; // Replace with real gateway logic

        if (paymentSucceeded) {
            // Emit: payment status update
            await produceEvent(TOPICS.ORDER_STATUS_UPDATE, {
                eventId,
                orderId,
                paymentStatus: 'completed',
            });

            // Emit: trigger delivery
            await produceEvent(TOPICS.PAYMENT_COMPLETED, {
                eventId,
                orderId,
                userId,
                items,
                paymentMethod,
                paymentStatus: 'completed',
            });

            console.log(`[Payment]   Payment successful for order ${orderId} — ₹${totalPrice}`);
        } else {
            await produceEvent(TOPICS.ORDER_STATUS_UPDATE, {
                eventId,
                orderId,
                paymentStatus: 'failed',
                status: 'cancelled',
            });

            console.log(`[Payment]   Payment failed for order ${orderId}`);
        }

    } catch (error) {
        console.error('[Payment]   Error processing event:', error);
        throw error; // re-throw so Kafka retry / DLQ picks it up
    }
};

module.exports = paymentHandler;