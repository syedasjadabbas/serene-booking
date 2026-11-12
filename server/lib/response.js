const successResponse = (res, data = null, message = "OK", status = 200) =>
  res.status(status).json({ success: true, message, data });

const errorResponse = (res, status, message, code, details) =>
  res.status(status).json({ success: false, message, data: null, ...(code ? { code } : {}), ...(details ? { details } : {}) });

module.exports = { successResponse, errorResponse };
