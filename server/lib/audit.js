const prisma = require("../config/prisma");
const logger = require("./logger");

// Fire-and-forget audit row for security-relevant actions. Never blocks or fails the request.
function audit({ actorType = "system", actorId, action, entity, entityId, ip, meta }) {
  prisma.auditLog
    .create({ data: { actorType, actorId, action, entity, entityId, ip, meta } })
    .catch((err) => logger.error({ err: err.message, action }, "audit write failed"));
}

module.exports = { audit };
