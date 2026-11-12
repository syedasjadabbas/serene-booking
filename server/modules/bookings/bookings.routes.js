const router = require("express").Router();
const c = require("./bookings.controller");
const v = require("./bookings.validators");
const { validateBody, validateQuery, validateParams } = require("../../lib/validate");
const { requireAuth, optionalAuth } = require("../../middlewares/auth");
const { bookingLimiter, lookupLimiter } = require("../../middlewares/rateLimit");

// Booking works for guests and signed-in customers. Ownership is enforced in the service.
router.post("/", bookingLimiter, optionalAuth, validateBody(v.createBookingSchema), c.create);
router.get("/mine", requireAuth, validateQuery(v.mineQuery), c.listMine);
router.get("/mine/:reference", requireAuth, validateParams(v.referenceParams), c.getMine);
// POST so the email never lands in a URL or access log.
router.post("/lookup", lookupLimiter, validateBody(v.lookupSchema), c.lookup);
router.post("/:reference/cancel", lookupLimiter, optionalAuth, validateParams(v.referenceParams), validateBody(v.cancelSchema), c.cancel);

module.exports = router;
