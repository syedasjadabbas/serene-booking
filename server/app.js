const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");
const crypto = require("crypto");

const env = require("./config/env");
const logger = require("./lib/logger");
const { apiLimiter } = require("./middlewares/rateLimit");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./modules/auth/auth.routes");
const propertyRoutes = require("./modules/property/property.routes");
const roomsRoutes = require("./modules/rooms/rooms.routes");
const bookingsRoutes = require("./modules/bookings/bookings.routes");
const reviewsRoutes = require("./modules/reviews/reviews.routes");

const app = express();

// Middleware order: security headers → CORS → parsers → request log → rate limit → routes → 404 → errors
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    autoLogging: { ignore: (req) => req.url === "/api/v1/health" },
  })
);

app.get("/api/v1/health", (_req, res) => res.json({ success: true, message: "OK", data: { time: new Date().toISOString() } }));

const api = express.Router();
api.use(apiLimiter);
api.use("/auth", authRoutes);
api.use("/property", propertyRoutes);
api.use("/rooms", roomsRoutes);
api.use("/bookings", bookingsRoutes);
api.use("/reviews", reviewsRoutes);
app.use("/api/v1", api);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
