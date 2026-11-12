const service = require("./bookings.service");
const { successResponse } = require("../../lib/response");

const meta = (req) => ({ ip: req.ip });

exports.create = async (req, res, next) => {
  try {
    successResponse(res, await service.createBooking(req.body, req.auth, meta(req)), "Booking confirmed", 201);
  } catch (err) {
    next(err);
  }
};

exports.listMine = async (req, res, next) => {
  try {
    successResponse(res, await service.listMine(req.auth.customerId, req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    successResponse(res, await service.getMine(req.auth.customerId, req.validatedParams.reference));
  } catch (err) {
    next(err);
  }
};

exports.lookup = async (req, res, next) => {
  try {
    successResponse(res, await service.lookup(req.body, meta(req)));
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const result = await service.cancel(req.validatedParams.reference, { auth: req.auth, ...req.body }, meta(req));
    successResponse(res, result, "Booking cancelled");
  } catch (err) {
    next(err);
  }
};
