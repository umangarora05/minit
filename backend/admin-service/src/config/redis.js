// ========================================================================
// Redis Config — Cache helper (Upstash REST client)
// ========================================================================

const { Redis } = require('@upstash/redis');

let client = null;

// ── Connect ──────────────────────────────────────────────────────────────
const connectRedis = async () => {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            throw new Error('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing in environment');
        }
        client = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('  Redis (Upstash) connected via REST');
    } catch (error) {
        console.error('  Redis failed to connect:', error.message);
        client = null; // ensure we don't try to use a broken client
    }
};

// ── Readiness check ──────────────────────────────────────────────────────
const isReady = () => client !== null;

// ── GET ──────────────────────────────────────────────────────────────────
const getCache = async (key) => {
    if (!isReady()) return null;
    return await client.get(key);
};

// ── SET (with optional TTL in seconds) ──────────────────────────────────
const setCache = async (key, value, ttlSeconds = 300) => {
    if (!isReady()) throw new Error('[Redis] Client not ready — cannot set cache');
    await client.set(key, String(value), { ex: ttlSeconds });
};

// ── DELETE ───────────────────────────────────────────────────────────────
const delCache = async (key) => {
    if (!isReady()) return; // best-effort delete; not fatal
    await client.del(key);
};

module.exports = { connectRedis, isReady, getCache, setCache, delCache };
