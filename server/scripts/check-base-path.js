// Rule: the website's base path and the refresh-cookie path must agree.
// The website is served under /booking, so the browser sees auth calls at /booking/api/v1/auth.
// If the server sets the cookie on any other path the browser never sends it back and every
// visitor is silently signed out after 15 minutes. Run: node scripts/check-base-path.js
const fs = require("fs");
const path = require("path");

const nextConfig = fs.readFileSync(path.join(__dirname, "../../client/next.config.mjs"), "utf8");
const match = nextConfig.match(/NEXT_PUBLIC_BASE_PATH \?\? "([^"]*)"/);
if (!match) {
  console.error("✗ could not find the default base path in client/next.config.mjs");
  process.exit(1);
}
const basePath = match[1];

delete process.env.AUTH_COOKIE_PATH; // check the shipped default, not this shell's env
const env = require("../config/env");
const expected = `${basePath}/api/v1/auth`;

if (env.authCookiePath !== expected) {
  console.error(`✗ cookie path "${env.authCookiePath}" does not match website base path "${basePath}" (expected "${expected}")`);
  process.exit(1);
}

const apiConst = fs.readFileSync(path.join(__dirname, "../../client/global/constants/api.ts"), "utf8");
if (!apiConst.includes("${BASE_PATH}/api/v1")) {
  console.error("✗ client API_BASE does not use the base path (global/constants/api.ts)");
  process.exit(1);
}

console.log(`✓ base path "${basePath}" — client API ${basePath}/api/v1, refresh cookie ${expected}`);
