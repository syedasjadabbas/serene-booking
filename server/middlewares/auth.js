const { verifyAccessToken } = require("../lib/jwt");
const { isSessionActive } = require("../lib/sessions");
const { AppError } = require("../lib/customError");

async function resolveAuth(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  let payload;
  try {
    payload = verifyAccessToken(header.slice(7));
  } catch {
    throw new AppError(401, "Your session expired. Please sign in again.", true, "TOKEN_INVALID");
  }
  if (!(await isSessionActive(payload.sid))) {
    throw new AppError(401, "You were signed out. Please sign in again.", true, "SESSION_REVOKED");
  }
  return { customerId: payload.sub, sessionId: payload.sid };
}

const requireAuth = async (req, _res, next) => {
  try {
    const auth = await resolveAuth(req);
    if (!auth) throw new AppError(401, "Please sign in to continue.", true, "AUTH_REQUIRED");
    req.auth = auth;
    next();
  } catch (err) {
    next(err);
  }
};

// Guests can book without an account; if a valid token is sent we attach the customer.
const optionalAuth = async (req, _res, next) => {
  try {
    req.auth = await resolveAuth(req);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuth, optionalAuth };
