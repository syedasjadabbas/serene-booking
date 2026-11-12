const rateLimit = require("express-rate-limit");

const handler = (_req, res, _next, options) =>
  res.status(options.statusCode).json({ success: false, message: "Too many requests. Please wait a moment and try again.", data: null, code: "RATE_LIMITED" });

const base = { standardHeaders: "draft-7", legacyHeaders: false, handler };

module.exports = {
  apiLimiter: rateLimit({ ...base, windowMs: 60_000, limit: 300 }),
  authLimiter: rateLimit({ ...base, windowMs: 15 * 60_000, limit: 20 }),
  bookingLimiter: rateLimit({ ...base, windowMs: 15 * 60_000, limit: 15 }),
  lookupLimiter: rateLimit({ ...base, windowMs: 15 * 60_000, limit: 20 }),
};
