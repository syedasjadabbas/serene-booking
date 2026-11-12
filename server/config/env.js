require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const bool = (v, d) => (v === undefined || v === "" ? d : ["1", "true", "yes", "on"].includes(String(v).toLowerCase()));
const int = (v, d) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: int(process.env.PORT, 4000),
  databaseUrl: process.env.DATABASE_URL,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-only-insecure-secret",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtlDays: int(process.env.REFRESH_TOKEN_TTL_DAYS, 30),
  singleSessionPerPlatform: bool(process.env.SINGLE_SESSION_PER_PLATFORM, true),

  clientOrigin: (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim()),
  // Shared with the website's proxy so the API can trust the forwarded visitor IP (see middlewares/clientIp.js).
  proxySecret: process.env.PROXY_SECRET || "",
  redisUrl: process.env.REDIS_URL || "",

  currency: process.env.CURRENCY || "PKR",
  taxPercent: int(process.env.TAX_PERCENT, 16),
  weekendUpliftPercent: int(process.env.WEEKEND_UPLIFT_PERCENT, 10),
  maxStayNights: int(process.env.MAX_STAY_NIGHTS, 30),
  maxRoomsPerBooking: int(process.env.MAX_ROOMS_PER_BOOKING, 5),

  // Dev only: when false (default), loopback requests skip rate limits. Production always limits.
  rateLimitLocal: bool(process.env.RATE_LIMIT_LOCAL, false),

  paymentsEnabled: bool(process.env.PAYMENTS_ENABLED, false),
  reviewsEnabled: bool(process.env.REVIEWS_ENABLED, true),

  timezone: "Asia/Karachi",
};

if (env.isProd) {
  const missing = [];
  if (env.jwtAccessSecret === "dev-only-insecure-secret") missing.push("JWT_ACCESS_SECRET");
  if (!env.databaseUrl) missing.push("DATABASE_URL");
  if (missing.length) throw new Error(`Missing required production env: ${missing.join(", ")}`);
  if (!env.proxySecret) {
    // Not fatal, but rate limits would then be keyed on the proxy's IP (shared by all visitors).
    console.warn("PROXY_SECRET is not set: visitor IPs can't be trusted through the website proxy.");
  }
}

module.exports = env;
