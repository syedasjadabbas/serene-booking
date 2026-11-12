const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const { AppError } = require("../../lib/customError");
const { signAccessToken } = require("../../lib/jwt");
const { createSession, rotateSession, revokeSessions } = require("../../lib/sessions");
const { audit } = require("../../lib/audit");

const customerSelect = { id: true, email: true, firstName: true, lastName: true, phone: true, country: true, createdAt: true };

async function issueTokens(customerId, meta) {
  const { sessionId, refreshToken, expiresAt } = await createSession({ customerId, ...meta });
  return { accessToken: signAccessToken({ customerId, sid: sessionId }), refreshToken, refreshExpiresAt: expiresAt };
}

async function register(input, meta) {
  const exists = await prisma.customer.findUnique({ where: { email: input.email }, select: { id: true } });
  if (exists) throw new AppError(409, "An account with this email already exists. Try signing in.", true, "EMAIL_TAKEN");

  const customer = await prisma.customer.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, 12),
    },
    select: customerSelect,
  });

  // Earlier guest bookings are NOT auto-linked by email: emails are unverified, so that would let
  // anyone who registers with someone else's address see their bookings. Add after email verification.

  audit({ actorType: "customer", actorId: customer.id, action: "auth.register", ip: meta.ip });
  return { customer, ...(await issueTokens(customer.id, meta)) };
}

async function login({ email, password }, meta) {
  const customer = await prisma.customer.findUnique({ where: { email }, select: { ...customerSelect, passwordHash: true, status: true } });
  const ok = customer && (await bcrypt.compare(password, customer.passwordHash));
  if (!ok) {
    audit({ actorType: "guest", action: "auth.login_failed", ip: meta.ip, meta: { email } });
    throw new AppError(401, "Email or password is incorrect.", true, "BAD_CREDENTIALS");
  }
  if (customer.status !== "ACTIVE") throw new AppError(403, "This account is not active. Please contact the front desk.", true, "ACCOUNT_INACTIVE");

  const { passwordHash, status, ...safe } = customer;
  audit({ actorType: "customer", actorId: customer.id, action: "auth.login", ip: meta.ip });
  return { customer: safe, ...(await issueTokens(customer.id, meta)) };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw new AppError(401, "Please sign in.", true, "NO_REFRESH");
  const result = await rotateSession(refreshToken);
  if (result.error) throw new AppError(401, result.error, true, "REFRESH_FAILED");
  const customer = await prisma.customer.findUnique({ where: { id: result.customerId }, select: customerSelect });
  return {
    customer,
    accessToken: signAccessToken({ customerId: result.customerId, sid: result.sessionId }),
    refreshToken: result.refreshToken,
  };
}

async function logout(auth) {
  if (auth?.sessionId) {
    await revokeSessions({ sessionId: auth.sessionId, reason: "logout" });
    audit({ actorType: "customer", actorId: auth.customerId, action: "auth.logout" });
  }
}

const me = (customerId) => prisma.customer.findUnique({ where: { id: customerId }, select: customerSelect });

const updateProfile = (customerId, data) => prisma.customer.update({ where: { id: customerId }, data, select: customerSelect });

async function changePassword(auth, { currentPassword, newPassword }, meta) {
  const c = await prisma.customer.findUnique({ where: { id: auth.customerId }, select: { passwordHash: true } });
  if (!c || !(await bcrypt.compare(currentPassword, c.passwordHash))) {
    throw new AppError(400, "Current password is incorrect.", true, "BAD_PASSWORD");
  }
  await prisma.customer.update({ where: { id: auth.customerId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  // Password change signs out every device, then issues a fresh session for this one.
  await revokeSessions({ customerId: auth.customerId, reason: "password_change" });
  audit({ actorType: "customer", actorId: auth.customerId, action: "auth.password_change", ip: meta.ip });
  return issueTokens(auth.customerId, meta);
}

module.exports = { register, login, refresh, logout, me, updateProfile, changePassword };
