require("dotenv").config();

const express = require("express");
const connectDB = require("./db/connect");
const corsMiddleware = require("./middleware/cors");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const collectionRoutes = require("./routes/collections");
const sharingRoutes = require("./routes/sharing");

const app = express();
const PORT = process.env.PORT || 5000;

// ----- Global middleware -----
app.use(corsMiddleware); // Allow the frontend (different origin) to call us.
app.use(express.json()); // Parse JSON request bodies.

// ----- Health check -----
// Handy for confirming the server is up without touching the database.
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// ----- Feature routes -----
app.use("/api/collections", collectionRoutes);
app.use("/api", sharingRoutes); // POST /api/collections/:id/share, GET /api/share/:code

// ----- Error handling (must come last) -----
app.use(notFound); // Unknown routes -> JSON 404.
app.use(errorHandler); // Everything else -> consistent JSON error.

/**
 * Connect to the database first, then start listening. If the DB connection
 * fails we exit rather than run a server that can't serve real requests.
 */
const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();

module.exports = app; // Exported for testing.
