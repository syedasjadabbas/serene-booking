const service = require("./reviews.service");
const { successResponse } = require("../../lib/response");

exports.list = async (req, res, next) => {
  try {
    successResponse(res, await service.list(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    successResponse(res, await service.create(req.auth.customerId, req.body, { ip: req.ip }), "Thank you for your review", 201);
  } catch (err) {
    next(err);
  }
};
