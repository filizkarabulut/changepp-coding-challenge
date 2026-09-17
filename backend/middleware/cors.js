const cors = require("cors");

/**
 * CORS configuration.
 *
 * The frontend runs on a different origin (port 3000) than this API (port 5000),
 * so the browser needs explicit permission to call us. We allow the configured
 * client origin, and fall back to reflecting the request origin in development
 * so tools like Postman / curl and local dev servers just work.
 */
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const corsMiddleware = cors({
  origin: clientOrigin === "*" ? true : [clientOrigin, "http://localhost:5173"],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

module.exports = corsMiddleware;
