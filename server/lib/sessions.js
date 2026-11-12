const crypto = require("crypto");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { cached, invalidate } = require("./cache");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const newRefreshToken = () => crypto.randomBytes(48).toString("base64url");

async function createSession({ customerId, platform = "web", userAgent, ip }) {
  if (env.singleSessionPerPlatform) {
    await revokeSessions({ customerId, platform, reason: "new_login" });
  }
  const refreshToken = newRefreshToken();
  const session = await prisma.session.create({
    data: {
      customerId,
      platform,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: userAgent?.slice(0, 300),
      ip,
      expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 86400_000),
    },
    select: { id: true, expiresAt: true },
  });
  return { sessionId: session.id, refreshToken, expiresAt: session.expiresAt };
}

// Rotates the refresh token: the old one stops working as soon as a new one is issued.
async function rotateSession(refreshToken) {
  const hash = hashToken(refreshToken);
  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: hash },
    select: { id: true, customerId: true, revokedAt: true, expiresAt: true, customer: { select: { status: true } } },
  });
  if (!session) return { error: "Your session has ended. Please sign in again." };
  if (session.revokedAt) return { error: "You were signed out on this device. Please sign in again." };
  if (session.expiresAt < new Date()) return { error: "Your session expired. Please sign in again." };
  if (session.customer.status !== "ACTIVE") {
    await revokeSessions({ customerId: session.customerId, reason: "status_change" });
    return { error: "This account is not active. Please contact the front desk." };
  }
  const next = newRefreshToken();
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshTokenHash: hashToken(next), lastUsedAt: new Date() },
  });
  return { sessionId: session.id, customerId: session.customerId, refreshToken: next };
}

async function revokeSessions({ customerId, sessionId, platform, reason }) {
  const where = { revokedAt: null, ...(customerId ? { customerId } : {}), ...(sessionId ? { id: sessionId } : {}), ...(platform ? { platform } : {}) };
  await prisma.session.updateMany({ where, data: { revokedAt: new Date(), revokeReason: reason } });
  await invalidate("session:");
}

// Hot path: called on every authenticated request. Cached briefly; revocation invalidates.
function isSessionActive(sessionId) {
  return cached(
    `session:${sessionId}`,
    async () => {
      const s = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { revokedAt: true, expiresAt: true, customer: { select: { status: true } } },
      });
      return Boolean(s && !s.revokedAt && s.expiresAt > new Date() && s.customer.status === "ACTIVE");
    },
    { ttlMs: 30_000, staleMs: 0 }
  );
}

module.exports = { createSession, rotateSession, revokeSessions, isSessionActive, hashToken };
