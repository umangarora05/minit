// ========================================================================
// Kafka Consumer — Order Service (Sole Order State Owner) [CONCURRENCY-SAFE]
// ========================================================================
// Protections:
//   1. Optimistic locking   — version field in query filter + $inc
//   2. DB idempotency       — eventId stored in Order.processedEvents
//   3. State transition map — prevents invalid status overwrites
//   4. Retry on version conflict — re-reads fresh doc and retries
//
// No in-memory state — safe across multiple instances / restarts.
// ========================================================================

const Order = require('../../models/Order');

// ── Valid state transitions ─────────────────────────────────────────────
// Maps each status to the set of statuses it is ALLOWED to transition to.
// Any transition not listed here will be rejected.
const VALID_TRANSITIONS = {
    pending:          ['confirmed', 'cancelled'],
    confirmed:        ['preparing', 'cancelled'],
    preparing:        ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered:        [],       // terminal state — no further transitions
    cancelled:        [],       // terminal state — no further transitions
};

// Maximum retries for version conflicts before giving up
const MAX_VERSION_RETRIES = 5;

const orderStatusHandler = async ({ parsedValue }) => {
    try {
        console.log("📥 ORDER EVENT RECEIVED:", parsedValue); // DEBUG

        const { eventId, orderId, status, paymentStatus, reason } = parsedValue;

        // ── Validate input ──────────────────────────────────────────────
        if (!eventId || !orderId) {
            console.log('[Order]   Invalid event received:', parsedValue);
            return;
        }

        // ── Build update object ────────────────────────────────────────
        const update = {};
        if (status)        update.status = status;
        if (paymentStatus) update.paymentStatus = paymentStatus;

        if (Object.keys(update).length === 0) {
            console.warn(`[Order] Event ${eventId} had no actionable fields — skipping`);
            return;
        }

        // ── Retry loop for optimistic locking ──────────────────────────
        for (let attempt = 1; attempt <= MAX_VERSION_RETRIES; attempt++) {

            // ── Read current order state ────────────────────────────────
            const currentOrder = await Order.findById(orderId);

            if (!currentOrder) {
                console.warn(`[Order] ⚠️ Order not found for orderId: ${orderId}`);
                return;
            }

            // ── DB idempotency check ────────────────────────────────────
            // If this eventId was already processed, skip entirely.
            if (currentOrder.processedEvents && currentOrder.processedEvents.includes(eventId)) {
                console.log(`[Order] ⏭ Duplicate event ${eventId} — skipping`);
                return;
            }

            // ── State transition guard ──────────────────────────────────
            // Only validate if the event is trying to change `status`.
            if (status) {
                const currentStatus = currentOrder.status;
                const allowed = VALID_TRANSITIONS[currentStatus] || [];

                if (!allowed.includes(status)) {
                    console.warn(
                        `[Order] 🚫 Invalid transition: ${currentStatus} → ${status} ` +
                        `for order ${orderId} (event ${eventId}) — skipping`
                    );
                    return;
                }
            }

            // ── Atomic update with optimistic locking ───────────────────
            // The query filter includes BOTH _id AND the current version.
            // If another consumer already incremented the version, this
            // update returns null and we retry with the fresh version.
            const updatedOrder = await Order.findOneAndUpdate(
                {
                    _id: orderId,
                    version: currentOrder.version,           // optimistic lock
                    processedEvents: { $nin: [eventId] },    // idempotency guard
                },
                {
                    $set: update,
                    $inc: { version: 1 },                    // bump version
                    $push: { processedEvents: eventId },     // mark event done
                },
                { new: true }
            );

            if (updatedOrder) {
                // ── Success ─────────────────────────────────────────────
                console.log(
                    `[Order]   Order ${orderId} updated (v${currentOrder.version}→v${updatedOrder.version}):`,
                    update,
                    reason ? `| reason: ${reason}` : ''
                );
                return;
            }

            // ── Version conflict — another writer won ───────────────────
            console.warn(
                `[Order] ⚠️ Version conflict on attempt ${attempt}/${MAX_VERSION_RETRIES} ` +
                `for order ${orderId} (event ${eventId}) — retrying…`
            );

            // Brief backoff before retry (50ms, 100ms, 200ms, …)
            await new Promise(r => setTimeout(r, 50 * Math.pow(2, attempt - 1)));
        }

        // ── Exhausted retries ───────────────────────────────────────────
        // Throwing here lets the Kafka-level retry / DLQ logic handle it.
        throw new Error(
            `[Order] Version conflict not resolved after ${MAX_VERSION_RETRIES} attempts ` +
            `for order ${orderId} (event ${eventId})`
        );

    } catch (error) {
        console.error('[Order]   Error processing event:', error);
        throw error; // re-throw so Kafka retry / DLQ picks it up
    }
};

module.exports = orderStatusHandler;