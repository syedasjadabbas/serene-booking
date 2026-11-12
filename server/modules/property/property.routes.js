const router = require("express").Router();
const c = require("./property.controller");

router.get("/", c.getProperty);
router.get("/config", c.getPublicConfig);

module.exports = router;
