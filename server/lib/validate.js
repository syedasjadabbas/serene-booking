const { errorResponse } = require("./response");

const formatIssues = (error) =>
  error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));

const make = (source) => (schema) => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const issues = formatIssues(result.error);
    return errorResponse(res, 400, issues[0]?.message || "Invalid request", "VALIDATION_ERROR", issues);
  }
  // Express 4 lets us replace req.query; keep parsed (coerced) values for controllers.
  req[source === "body" ? "body" : source === "query" ? "validatedQuery" : "validatedParams"] = result.data;
  next();
};

module.exports = {
  validateBody: make("body"),
  validateQuery: make("query"),
  validateParams: make("params"),
};
