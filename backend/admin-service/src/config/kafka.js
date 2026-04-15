// ========================================================================
// Kafka Config — Multi-topic, Retry, Dead Letter Queue
// ========================================================================
// Uses KafkaJS. Consumers support:
//   - Idempotent event envelopes (eventId + timestamp on every message)
//   - Per-consumer retry (maxRetries, default 3)
//   - Dead Letter Queue routing after exhausted retries
// The EventEmitter fallback has been intentionally removed — if Kafka is
// unavailable, consumers log a clear error rather than silently using an
// in-process emitter that cannot scale across multiple processes.
// ========================================================================

const { Kafka } = require('kafkajs');
const { randomUUID } = require('crypto');

// ── Kafka client (created once on connect) ──────────────────────────────
let kafka = null;
let producer = null;

// ── Topic constants ─────────────────────────────────────────────────────
const TOPICS = {
    ORDER_CREATED:        'order_created',
    INVENTORY_CHECKED:    'inventory_checked',
    INVENTORY_FAILED:     'inventory_failed',
    PAYMENT_COMPLETED:    'payment_completed',
    PAYMENT_FAILED:       'payment_failed',
    ORDER_STATUS_UPDATE:  'order_status_update',
    DELIVERY_ASSIGNED:    'delivery_assigned',
    DLQ:                  'dlq',
};

// ── Initialize Kafka producer ────────────────────────────────────────────
const connectKafka = async () => {
    kafka = new Kafka({
        clientId: 'minit-backend',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        retry: { initialRetryTime: 300, retries: 5 },
    });

    producer = kafka.producer();
    try {
        await producer.connect();
        console.log('  Kafka producer connected');
    } catch (err) {
        console.error('  Kafka producer failed to connect:', err.message);
        process.exit(1);
    }
};

// ── Produce a single event ───────────────────────────────────────────────
// Wraps payload in a standard envelope: { eventId, topic, timestamp, ...payload }
// eventId is a UUID used by consumers for idempotency checks.
//
// KEY DESIGN: When the payload contains an `orderId`, it is used as the
// Kafka message key. This guarantees that all events for the same order
// land on the SAME partition, giving sequential processing per order.
const produceEvent = async (topic, payload) => {
    if (!producer) throw new Error('Kafka producer not initialised. Call connectKafka() first.');

    // Ensure we are connected before sending (idempotent, fast if already connected)
    try {
        await producer.connect();
    } catch (err) {
        throw new Error('Kafka producer disconnected and failed to reconnect: ' + err.message);
    }

    const envelope = {
        eventId: randomUUID(),
        topic,
        timestamp: new Date().toISOString(),
        ...payload,
    };

    await producer.send({
        topic,
        messages: [{
            // ── Partition key: orderId ensures same-order = same-partition ──
            key: payload.orderId ? String(payload.orderId) : null,
            value: JSON.stringify(envelope),
        }],
    });

    console.log(`[Producer] → ${topic} | eventId: ${envelope.eventId} | key: ${payload.orderId || 'none'}`);
    return envelope.eventId;
};

// ── Consume a topic with retry + DLQ ────────────────────────────────────
// handler: async ({ message, parsedValue }) => void
// options.maxRetries: number of attempts before routing to DLQ (default 3)
const consumeEvent = async (topic, groupId, handler, options = {}) => {
    if (!kafka) throw new Error('Kafka not initialised. Call connectKafka() first.');

    const { maxRetries = 3 } = options;
    const consumer = kafka.consumer({ groupId });

    try {
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });

        console.log(`[Consumer] ${groupId} → listening on topic: ${topic}`);

        await consumer.run({
            eachMessage: async ({ topic: t, partition, message }) => {
                let parsed;
                try {
                    parsed = JSON.parse(message.value.toString());
                } catch {
                    console.error(`[Consumer ${groupId}] Failed to parse message — routing to DLQ`);
                    await _sendToDLQ(topic, message.value.toString(), 'JSON parse error');
                    return;
                }

                // Retry loop
                let attempt = 0;
                while (attempt < maxRetries) {
                    try {
                        await handler({ message, parsedValue: parsed });
                        return; // success — stop retry loop
                    } catch (err) {
                        attempt++;
                        console.error(
                            `[Consumer ${groupId}] Error on attempt ${attempt}/${maxRetries}: ${err.message}`
                        );
                        if (attempt < maxRetries) {
                            // Exponential backoff: 500ms, 1s, 2s, …
                            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
                        }
                    }
                }

                // Exhausted retries — send to DLQ
                console.error(`[Consumer ${groupId}] Exhausted retries for eventId: ${parsed.eventId}. Sending to DLQ.`);
                await _sendToDLQ(topic, JSON.stringify(parsed), `Failed after ${maxRetries} attempts`);
            },
        });
    } catch (err) {
        console.error(`[Consumer ${groupId}] Failed to connect to Kafka: ${err.message}`);
        process.exit(1);
    }
};

// ── Internal: route a failed message to the dead-letter queue ───────────
const _sendToDLQ = async (originalTopic, rawValue, reason) => {
    if (!producer) return;
    try {
        await producer.send({
            topic: TOPICS.DLQ,
            messages: [{
                value: JSON.stringify({
                    originalTopic,
                    reason,
                    failedAt: new Date().toISOString(),
                    payload: rawValue,
                }),
            }],
        });
        console.log(`[DLQ] Message from topic "${originalTopic}" routed to DLQ. Reason: ${reason}`);
    } catch (err) {
        console.error('[DLQ] Could not route to DLQ:', err.message);
    }
};

module.exports = { connectKafka, produceEvent, consumeEvent, TOPICS };
