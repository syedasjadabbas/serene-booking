const service = require("./rooms.service");
const { successResponse } = require("../../lib/response");

exports.list = async (_req, res, next) => {
  try {
    successResponse(res, await service.listRoomTypes());
  } catch (err) {
    next(err);
  }
};

exports.availability = async (req, res, next) => {
  try {
    successResponse(res, await service.searchAvailability(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

exports.calendar = async (req, res, next) => {
  try {
    const { from, to, roomType } = req.validatedQuery;
    successResponse(res, await service.calendar({ from, to, roomTypeSlug: roomType }));
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    successResponse(res, await service.getRoomType(req.validatedParams.slug));
  } catch (err) {
    next(err);
  }
};

exports.rates = async (req, res, next) => {
  try {
    successResponse(res, await service.getRates(req.validatedParams.slug, req.validatedQuery));
  } catch (err) {
    next(err);
  }
};
