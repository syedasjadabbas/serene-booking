const env = require("../config/env");
const logger = require("./logger");

// Redis is optional. Without REDIS_URL the caches fall back to process memory.
let client = null;

if (env.redisUrl) {
  const Redis = require("ioredis");
  client = new Redis(env.redisUrl, { maxRetriesPerRequest: 2, lazyConnect: false });
  client.on("error", (err) => logger.warn({ err: err.message }, "redis error"));
}

module.exports = { redis: client };
