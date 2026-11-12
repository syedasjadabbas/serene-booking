const pino = require("pino");
const env = require("../config/env");

const logger = pino({
  level: process.env.LOG_LEVEL || (env.isProd ? "info" : "debug"),
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.passwordHash", "*.refreshToken"],
});

module.exports = logger;
