const service = require("./property.service");
const { successResponse } = require("../../lib/response");

exports.getProperty = async (_req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=300");
    successResponse(res, await service.getProperty());
  } catch (err) {
    next(err);
  }
};

exports.getPublicConfig = (_req, res) => successResponse(res, service.getPublicConfig());
