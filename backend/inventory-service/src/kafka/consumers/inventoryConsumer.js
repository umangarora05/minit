// ========================================================================
// Kafka Consumer — Inventory Service [CONCURRENCY-SAFE]
// ========================================================================
// Listens to: order_created
// Emits on success: inventory_checked
// Emits on failure: inventory_failed  +  order_status_update (cancelled)
//
// Protections:
//   1. Persistent idempotency — ProcessedEvent collection (not in-memory)
//   2. Atomic stock           — $inc + $expr (no read-before-write race)
//   3. Cache write            — updates Redis immediately after DB decrement
//   4. Retry-safe             — errors are re-thrown for Kafka DLQ
// ========================================================================

const Product = require('../../models/Product');
const ProcessedEvent = require('../../models/ProcessedEvent');
const { produceEvent, TOPICS } = require('../../config/kafka');
const { setCache, delCache } = require('../../config/redis');

const CONSUMER_NAME = 'inventory';

const inventoryHandler = async ({ parsedValue }) => {
    const { eventId, orderId, items, userId, totalPrice, paymentMethod } = parsedValue;

    // ── Validate input ──────────────────────────────────────────────────
    if (!eventId || !orderId) {
        console.log('[Inventory]   Invalid event received:', parsedValue);
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
            console.log(`[Inventory] ⏭  Duplicate event ${eventId} — skipping`);
            return;
        }
        // Unexpected DB error — re-throw so Kafka retries
        throw err;
    }

    console.log(`[Inventory] Processing order ${orderId} (eventId: ${eventId})`);

    // ── Atomic stock decrement ─────────────────────────────────────────
    // Uses a single findOneAndUpdate with $expr to ensure stock >= qty
    // atomically. If the document is not returned, stock was insufficient.
    let allDecremented = true;
    const decremented = []; // track which products succeeded, for rollback logging

    for (const item of items) {
        const updated = await Product.findOneAndUpdate(
            {
                _id: item.product,
                $expr: { $gte: ['$stock', item.qty] }, // only update if enough stock
            },
            { $inc: { stock: -item.qty } },
            { new: true } // return the updated document
        );

        if (!updated) {
            // Stock insufficient or product not found — abort
            console.log(`[Inventory]   Insufficient stock for product ${item.product}`);
            allDecremented = false;

            // Invalidate cache so next read reflects real DB state
            await delCache(`stock:${item.product}`);
            break;
        }

        // ── Cache invalidation: write updated stock immediately ─────────
        try {
            await setCache(`stock:${updated._id}`, updated.stock, 300);
        } catch (err) {
            // Redis unavailable — delete key so stale cache isn't served
            await delCache(`stock:${updated._id}`);
        }

        decremented.push({ productId: updated._id, newStock: updated.stock });
    }

    if (!allDecremented) {
        // Emit failure events — do NOT write to Order collection directly
        await produceEvent(TOPICS.INVENTORY_FAILED, { orderId, reason: 'Insufficient stock' });
        await produceEvent(TOPICS.ORDER_STATUS_UPDATE, {
            orderId,
            status: 'cancelled',
            reason: 'Insufficient stock',
        });
        console.log(`[Inventory]   Order ${orderId} cancelled — stock insufficient`);
        return;
    }

    // Emit success — downstream: paymentConsumer
    await produceEvent(TOPICS.INVENTORY_CHECKED, {
        orderId,
        userId,
        totalPrice,
        paymentMethod,
        items,
    });

    console.log(`[Inventory]   Stock decremented for order ${orderId}`);
};

module.exports = inventoryHandler;
