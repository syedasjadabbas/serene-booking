// Vercel serverless entry: Vercel runs this file as a function and calls the Express app for every
// request (vercel.json rewrites all paths here). Locally the API still starts with `node server.js`.
module.exports = require("../app");
