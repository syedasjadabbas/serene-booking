const { redis } = require("./redis");
const logger = require("./logger");

// Stale-while-revalidate cache with single-flight.
// - fresh for `ttlMs`; served stale for up to `staleMs` more while one refresh runs in the background
// - concurrent misses for the same key share one in-flight promise
// Put every query parameter in the key.

const memory = new Map(); // key -> { value, freshUntil, staleUntil }
const inflight = new Map(); // key -> Promise

async function readEntry(key) {
  if (redis) {
    try {
      const raw = await redis.get(`sb:${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.warn({ err: err.message, key }, "cache read failed");
    }
  }
  return memory.get(key) || null;
}

async function writeEntry(key, entry) {
  if (redis) {
    try {
      const ttlSec = Math.ceil((entry.staleUntil - Date.now()) / 1000);
      await redis.set(`sb:${key}`, JSON.stringify(entry), "EX", Math.max(ttlSec, 1));
      return;
    } catch (err) {
      logger.warn({ err: err.message, key }, "cache write failed");
    }
  }
  memory.set(key, entry);
  if (memory.size > 2000) memory.delete(memory.keys().next().value);
}

function refresh(key, loader, ttlMs, staleMs) {
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const value = await loader();
      const now = Date.now();
      await writeEntry(key, { value, freshUntil: now + ttlMs, staleUntil: now + ttlMs + staleMs });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

async function cached(key, loader, { ttlMs = 30_000, staleMs = 120_000 } = {}) {
  const entry = await readEntry(key);
  const now = Date.now();
  if (entry && entry.freshUntil > now) return entry.value;
  if (entry && entry.staleUntil > now) {
    refresh(key, loader, ttlMs, staleMs).catch((err) => logger.warn({ err: err.message, key }, "background refresh failed"));
    return entry.value;
  }
  return refresh(key, loader, ttlMs, staleMs);
}

async function invalidate(prefix) {
  for (const k of memory.keys()) if (k.startsWith(prefix)) memory.delete(k);
  if (redis) {
    try {
      const keys = await redis.keys(`sb:${prefix}*`);
      if (keys.length) await redis.del(keys);
    } catch (err) {
      logger.warn({ err: err.message, prefix }, "cache invalidate failed");
    }
  }
}

module.exports = { cached, invalidate };
