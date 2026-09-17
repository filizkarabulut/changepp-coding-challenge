const mongoose = require("mongoose");

/**
 * Establish a connection to MongoDB using the URI from the environment.
 * Throws if the connection fails so the caller can decide how to react
 * (we exit the process in server.js).
 *
 * @param {string} uri - MongoDB connection string.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("MONGODB_URI is not defined. Check your .env file.");
  }

  // Mongoose buffers commands by default; failing fast makes startup issues obvious.
  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

module.exports = connectDB;
