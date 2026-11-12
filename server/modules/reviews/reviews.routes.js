const router = require("express").Router();
const c = require("./reviews.controller");
const v = require("./reviews.validators");
const { validateBody, validateQuery } = require("../../lib/validate");
const { requireAuth } = require("../../middlewares/auth");

router.get("/", validateQuery(v.listQuery), c.list);
router.post("/", requireAuth, validateBody(v.createReviewSchema), c.create);

module.exports = router;
