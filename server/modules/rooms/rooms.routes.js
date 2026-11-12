const router = require("express").Router();
const c = require("./rooms.controller");
const v = require("./rooms.validators");
const { validateQuery, validateParams } = require("../../lib/validate");

// Public: guests browse without signing in.
router.get("/", c.list);
router.get("/availability", validateQuery(v.staySchema), c.availability);
router.get("/:slug", validateParams(v.slugParams), c.detail);
router.get("/:slug/rates", validateParams(v.slugParams), validateQuery(v.staySchema), c.rates);

module.exports = router;
