// ========================================================================
// Kafka Consumer — Delivery Service [CONCURRENCY-SAFE]
// ========================================================================
// Listens to: payment_completed
// Emits on success: order_status_update (status: confirmed)
//                   delivery_assigned
//
// Protections:
//   1. Persistent idempotency — ProcessedEvent collection (not in-memory)
//   2. Retry-safe             — errors are re-thrown for Kafka DLQ
//
// Key design: trusts the event chain — if payment_completed arrived, both
// inventory and payment already succeeded. No need to re-check order state.
// Does NOT write directly to Order collection.
// ========================================================================

const { produceEvent, TOPICS } = require('../../config/kafka');
const ProcessedEvent = require('../../models/ProcessedEvent');

const CONSUMER_NAME = 'delivery';

const deliveryHandler = async ({ parsedValue }) => {
    const { eventId, orderId, userId, items } = parsedValue;

    // ── Validate input ──────────────────────────────────────────────────
    if (!eventId || !orderId) {
        console.log('[Delivery]   Invalid event received:', parsedValue);
        return;
    }

    // ── Persistent idempotency check ────────────────────────────────────
    // Try to insert a record for this (eventId, consumer) pair.
    // If it already exists, the unique index throws a duplicate-key error.
    try {
        await ProcessedEvent.create({ eventId, consumer: CONSUMER_NAME });
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key — this event was already processed
            console.log(`[Delivery] ⏭  Duplicate event ${eventId} — skipping`);
            return;
        }
        // Unexpected DB error — re-throw so Kafka retries
        throw err;
    }

    console.log(`[Delivery] Allocating agent for order ${orderId}`);

    // Simulate finding an available delivery agent
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Emit: order confirmed + delivery info
    await produceEvent(TOPICS.ORDER_STATUS_UPDATE, {
        orderId,
        status: 'confirmed',
    });

    await produceEvent(TOPICS.DELIVERY_ASSIGNED, {
        orderId,
        userId,
        items,
        assignedAt: new Date().toISOString(),
    });

    console.log(`[Delivery]   Agent allocated for order ${orderId} — status: confirmed`);
};

module.exports = deliveryHandler;
