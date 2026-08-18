// ========================================================================
// Kafka Config — Multi-topic, Retry, Dead Letter Queue
// ========================================================================

const { Kafka } = require('kafkajs');
const { randomUUID } = require('crypto');

let kafka = null;
let producer = null;

const TOPICS = {
    ORDER_CREATED: 'umangarora05.order_created',
    INVENTORY_CHECKED: 'umangarora05.inventory_checked',
    INVENTORY_FAILED: 'umangarora05.inventory_failed',
    PAYMENT_COMPLETED: 'umangarora05.payment_completed',
    PAYMENT_FAILED: 'umangarora05.payment_failed',
    ORDER_STATUS_UPDATE: 'umangarora05.order_status_update',
    DELIVERY_ASSIGNED: 'umangarora05.delivery_assigned',
    DLQ: 'umangarora05.dlq',
};

const connectKafka = async () => {
    kafka = new Kafka({
        clientId: 'umangarora05.minit-backend',
        brokers: [(process.env.KAFKA_BROKER || 'broker.subartaghosh.co.in:9092')],
        ssl: {
            rejectUnauthorized: false
        },
        sasl: {
            mechanism: 'scram-sha-512',
            username: process.env.KAFKA_USERNAME || 'umangarora05',
            password: process.env.KAFKA_PASSWORD || 'ulUMkvONoFrqad4il',
        },
        retry: { initialRetryTime: 300, retries: 5 },
    });

    producer = kafka.producer();
    try {
        await producer.connect();
        console.log('  Kafka producer connected to remote cluster');
    } catch (err) {
        console.error('  Kafka producer failed to connect:', err.message);
        process.exit(1);
    }
};

const produceEvent = async (topic, payload) => {
    if (!producer) throw new Error('Kafka producer not initialised. Call connectKafka() first.');

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
            key: payload.orderId ? String(payload.orderId) : null,
            value: JSON.stringify(envelope),
        }],
    });

    console.log(`[Producer] → ${topic} | eventId: ${envelope.eventId} | key: ${payload.orderId || 'none'}`);
    return envelope.eventId;
};

const consumeEvent = async (topic, groupId, handler, options = {}) => {
    if (!kafka) throw new Error('Kafka not initialised. Call connectKafka() first.');

    const { maxRetries = 3 } = options;
    const finalGroupId = groupId.startsWith('umangarora05.') ? groupId : `umangarora05.${groupId}`;
    const consumer = kafka.consumer({ groupId: finalGroupId });

    try {
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });

        console.log(`[Consumer] ${finalGroupId} → listening on topic: ${topic}`);

        await consumer.run({
            eachMessage: async ({ topic: t, partition, message }) => {
                let parsed;
                try {
                    parsed = JSON.parse(message.value.toString());
                } catch {
                    console.error(`[Consumer ${finalGroupId}] Failed to parse message — routing to DLQ`);
                    await _sendToDLQ(topic, message.value.toString(), 'JSON parse error');
                    return;
                }

                let attempt = 0;
                while (attempt < maxRetries) {
                    try {
                        await handler({ message, parsedValue: parsed });
                        return;
                    } catch (err) {
                        attempt++;
                        console.error(`[Consumer ${finalGroupId}] Error on attempt ${attempt}/${maxRetries}: ${err.message}`);
                        if (attempt < maxRetries) {
                            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
                        }
                    }
                }

                console.error(`[Consumer ${finalGroupId}] Exhausted retries for eventId: ${parsed.eventId}. Sending to DLQ.`);
                await _sendToDLQ(topic, JSON.stringify(parsed), `Failed after ${maxRetries} attempts`);
            },
        });
    } catch (err) {
        console.error(`[Consumer ${finalGroupId}] Failed to connect to Kafka: ${err.message}`);
        process.exit(1);
    }
};

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
