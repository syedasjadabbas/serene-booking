// Runnable check for the trusted-proxy rule (middlewares/clientIp.js): the forwarded visitor IP is used
// only when the request carries the right PROXY_SECRET.   npm run check
process.env.PROXY_SECRET = "check-secret-123";
const assert = require("assert/strict");
const { clientIp } = require("../middlewares/clientIp");

const run = (headers, ip = "10.0.0.1") => {
  const req = { headers, ip };
  clientIp(req, null, () => {});
  return req.ip;
};

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};

check("correct secret: visitor IP is trusted", () => {
  assert.equal(run({ "x-sb-proxy-key": "check-secret-123", "x-sb-client-ip": "203.0.113.9" }), "203.0.113.9");
});
check("first address of a list is used", () => {
  assert.equal(run({ "x-sb-proxy-key": "check-secret-123", "x-sb-client-ip": "198.51.100.7, 10.1.1.1" }), "198.51.100.7");
});
check("wrong or missing secret: header ignored", () => {
  assert.equal(run({ "x-sb-proxy-key": "nope", "x-sb-client-ip": "203.0.113.9" }), "10.0.0.1");
  assert.equal(run({ "x-sb-client-ip": "203.0.113.9" }), "10.0.0.1");
});
check("garbage IP values are ignored", () => {
  assert.equal(run({ "x-sb-proxy-key": "check-secret-123", "x-sb-client-ip": "<script>" }), "10.0.0.1");
});

console.log(`\n${passed} proxy-IP checks passed`);
