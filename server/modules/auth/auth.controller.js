const env = require("../../config/env");
const service = require("./auth.service");
const { successResponse } = require("../../lib/response");

const COOKIE = "sb_rt";
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax",
  path: "/api/v1/auth",
  maxAge: env.refreshTokenTtlDays * 86400_000,
});

const meta = (req) => ({ ip: req.ip, userAgent: req.headers["user-agent"], platform: "web" });

const withSession = (res, { refreshToken, refreshExpiresAt, ...rest }) => {
  res.cookie(COOKIE, refreshToken, cookieOptions());
  return rest;
};

exports.register = async (req, res, next) => {
  try {
    const result = await service.register(req.body, meta(req));
    successResponse(res, withSession(res, result), "Account created", 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await service.login(req.body, meta(req));
    successResponse(res, withSession(res, result), "Signed in");
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const result = await service.refresh(req.cookies[COOKIE]);
    successResponse(res, withSession(res, result), "Session refreshed");
  } catch (err) {
    res.clearCookie(COOKIE, { path: "/api/v1/auth" });
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await service.logout(req.auth);
    res.clearCookie(COOKIE, { path: "/api/v1/auth" });
    successResponse(res, null, "Signed out");
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    successResponse(res, await service.me(req.auth.customerId));
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    successResponse(res, await service.updateProfile(req.auth.customerId, req.body), "Profile updated");
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await service.changePassword(req.auth, req.body, meta(req));
    successResponse(res, withSession(res, result), "Password changed");
  } catch (err) {
    next(err);
  }
};
