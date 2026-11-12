const router = require("express").Router();
const c = require("./auth.controller");
const v = require("./auth.validators");
const { validateBody } = require("../../lib/validate");
const { requireAuth, optionalAuth } = require("../../middlewares/auth");
const { authLimiter } = require("../../middlewares/rateLimit");

router.post("/register", authLimiter, validateBody(v.registerSchema), c.register);
router.post("/login", authLimiter, validateBody(v.loginSchema), c.login);
router.post("/refresh", c.refresh);
router.post("/logout", optionalAuth, c.logout);
router.get("/me", requireAuth, c.me);
router.patch("/me", requireAuth, validateBody(v.updateProfileSchema), c.updateProfile);
router.post("/change-password", authLimiter, requireAuth, validateBody(v.changePasswordSchema), c.changePassword);

module.exports = router;
