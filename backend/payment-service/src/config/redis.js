// ========================================================================
// Redis Config — Cache helper (no in-memory fallback)
// ========================================================================
// Falls back gracefully on individual operation errors by throwing, so
// callers know the operation truly failed rather than silently reading
// stale data from a local Map.
// ========================================================================

const { createClient } = require('redis');

let client = null;

// ── Connect ──────────────────────────────────────────────────────────────
const connectRedis = async () => {
    try {
        client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        client.on('error', (err) => console.error('[Redis] Client error:', err.message));
        await client.connect();
        console.log('  Redis connected');
    } catch (error) {
        console.error(' Redis failed to connect:', error.message);
        client = null; // ensure we don't try to use a broken client
    }
};

// ── Readiness check ──────────────────────────────────────────────────────
const isReady = () => client !== null && client.isReady;

// ── GET ──────────────────────────────────────────────────────────────────
const getCache = async (key) => {
    if (!isReady()) return null;
    return await client.get(key);
};

// ── SET (with optional TTL in seconds) ──────────────────────────────────
const setCache = async (key, value, ttlSeconds = 300) => {
    if (!isReady()) throw new Error('[Redis] Client not ready — cannot set cache');
    await client.set(key, String(value), { EX: ttlSeconds });
};

// ── DELETE ───────────────────────────────────────────────────────────────
const delCache = async (key) => {
    if (!isReady()) return; // best-effort delete; not fatal
    await client.del(key);
};

module.exports = { connectRedis, isReady, getCache, setCache, delCache };
