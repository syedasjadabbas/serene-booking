class AppError extends Error {
  constructor(status, message, isOperational = true, code = undefined) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    this.code = code;
  }
}

module.exports = { AppError };
