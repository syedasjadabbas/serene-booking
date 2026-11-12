const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const handler = (_req, res, _next, options) =>
  res.status(options.statusCode).json({ success: false, message: "Too many requests. Please wait a moment and try again.", data: null, code: "RATE_LIMITED" });

// Development convenience: requests from this machine skip rate limits so local testing and
// `npm run smoke` can be repeated. Never applies in production. Set RATE_LIMIT_LOCAL=true to test limits locally.
const isLoopback = (ip = "") => ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1";
const skip = (req) => !env.isProd && !env.rateLimitLocal && isLoopback(req.ip);

const base = { standardHeaders: "draft-7", legacyHeaders: false, handler, skip };

module.exports = {
  apiLimiter: rateLimit({ ...base, windowMs: 60_000, limit: 300 }),
  authLimiter: rateLimit({ ...base, windowMs: 15 * 60_000, limit: 20 }),
  bookingLimiter: rateLimit({ ...base, windowMs: 15 * 60_000, limit: 15 }),
  lookupLimiter: rateLimit({ ...base, windowMs: 15 * 60_000, limit: 20 }),
};
