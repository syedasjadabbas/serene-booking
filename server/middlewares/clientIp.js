const crypto = require("crypto");
const env = require("../config/env");

// In production the browser talks to the website, which proxies /api/v1/* to this API. Without help,
// every request would appear to come from the proxy's IP, so rate limits would be shared by ALL visitors.
// The website's middleware forwards the visitor IP in x-sb-client-ip together with a shared secret
// (PROXY_SECRET). We only trust that header when the secret matches; otherwise req.ip is left as-is.
// Overriding req.ip here means rate limiting, audit logs, sessions and request logs all see the real IP.

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const IP_SHAPE = /^[0-9a-fA-F:.]{3,45}$/;

function clientIp(req, _res, next) {
  const key = req.headers["x-sb-proxy-key"];
  if (env.proxySecret && key && safeEqual(key, env.proxySecret)) {
    const forwarded = String(req.headers["x-sb-client-ip"] || "").split(",")[0].trim();
    if (IP_SHAPE.test(forwarded)) {
      Object.defineProperty(req, "ip", { value: forwarded, configurable: true, enumerable: true });
    }
  }
  next();
}

module.exports = { clientIp };
