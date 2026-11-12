const env = require("./config/env");
const app = require("./app");
const prisma = require("./config/prisma");
const logger = require("./lib/logger");

const server = app.listen(env.port, () => logger.info(`Serene Booking API listening on http://localhost:${env.port}/api/v1`));

const shutdown = async (signal) => {
  logger.info({ signal }, "shutting down");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
