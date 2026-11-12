const { AppError } = require("../lib/customError");
const { errorResponse } = require("../lib/response");
const logger = require("../lib/logger");

const notFound = (req, res) => errorResponse(res, 404, `Route not found: ${req.method} ${req.originalUrl}`, "NOT_FOUND");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError && err.isOperational) {
    return errorResponse(res, err.status, err.message, err.code);
  }
  if (err?.type === "entity.parse.failed") {
    return errorResponse(res, 400, "Request body is not valid JSON", "BAD_JSON");
  }
  logger.error({ err, path: req.originalUrl }, "unhandled error");
  return errorResponse(res, 500, "Something went wrong on our side. Please try again.", "INTERNAL");
};

module.exports = { notFound, errorHandler };
