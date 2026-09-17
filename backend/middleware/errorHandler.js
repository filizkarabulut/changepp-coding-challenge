/**
 * Lightweight error type so controllers can throw errors with a specific
 * HTTP status code (e.g. `throw new ApiError(404, "Collection not found")`).
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Wraps an async route handler so any rejected promise is forwarded to
 * Express's error handling chain instead of crashing the process.
 * Lets controllers use clean async/await without repetitive try/catch.
 *
 * @param {Function} fn - async (req, res, next) handler
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * 404 handler for unknown routes. Ensures the client always gets JSON,
 * never an HTML error page.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global error handler. Must be the last middleware mounted.
 * Translates common error types (validation, bad ObjectId) into helpful,
 * consistently-shaped JSON responses.
 */
// eslint-disable-next-line no-unused-vars -- Express requires the 4-arg signature.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error -> 400 with the first useful message.
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
  }

  // Malformed ObjectId (e.g. bad :id in the URL) -> 404 rather than a 500.
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found (invalid id)";
  }

  // Duplicate key (e.g. shareCode collision) -> 409.
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value violates a unique constraint";
  }

  if (statusCode >= 500) {
    console.error(err); // Log server-side faults for debugging.
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { ApiError, asyncHandler, notFound, errorHandler };
