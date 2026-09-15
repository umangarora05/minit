const { Kafka } = require('kafkajs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const legacyTopics = [
    'umangarora05.order_created',
    'umangarora05.inventory_checked',
    'umangarora05.inventory_failed',
    'umangarora05.payment_completed',
    'umangarora05.payment_failed',
    'umangarora05.order_status_update',
    'umangarora05.delivery_assigned',
    'umangarora05.dlq'
];

// These are the five physical topics used by KAFKA_TOPIC_MAP in the services.
const topicsToCreate = [
    'umangarora05.orders',
    'umangarora05.inventory',
    'umangarora05.payments',
    'umangarora05.delivery',
    'umangarora05.dlq'
];

const topicsToDelete = [...new Set([...legacyTopics, ...topicsToCreate])];

async function run() {
    console.log('Connecting to Kafka admin...');
    const certString = process.env.KAFKA_CA_CERT ? process.env.KAFKA_CA_CERT.replace(/\\n/g, '\n') : '';
    
    const kafka = new Kafka({
        clientId: 'admin-script',
        brokers: [process.env.KAFKA_BROKER],
        ssl: {
            ca: [certString],
        },
        sasl: {
            mechanism: 'plain',
            username: process.env.KAFKA_USERNAME,
            password: process.env.KAFKA_PASSWORD,
        },
    });

    const admin = kafka.admin();
    await admin.connect();
    
    try {
        const existingTopics = await admin.listTopics();
        const topicsToRemove = topicsToDelete.filter(topic => existingTopics.includes(topic));

        if (topicsToRemove.length > 0) {
            console.log('Deleting old Kafka topics:', topicsToRemove);
            await admin.deleteTopics({ topics: topicsToRemove, timeout: 30000 });
        }

        console.log('Creating five physical Kafka topics...');
        await admin.createTopics({
            waitForLeaders: true,
            topics: topicsToCreate.map(topic => ({
                topic,
                numPartitions: 1,
                replicationFactor: 1
            }))
        });

        console.log('Topics recreated successfully:', topicsToCreate);
        console.log('Current topics on cluster:', await admin.listTopics());
    } finally {
        await admin.disconnect();
    }
}

run().catch(console.error);
