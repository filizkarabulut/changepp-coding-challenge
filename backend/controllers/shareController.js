const crypto = require("crypto");
const Collection = require("../models/Collection");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");

const CODE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 8;

/**
 * Generate a random 8-character alphanumeric share code using a
 * cryptographically strong source of randomness.
 */
const generateShareCode = () => {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return code;
};

/**
 * POST /api/collections/:id/share
 * Generate (once) a public share link for a collection and mark it public
 * so the link actually resolves. Re-sharing returns the existing code.
 */
const shareCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  // Reuse an existing code if one was already generated; otherwise make a
  // unique one (retrying on the astronomically rare collision).
  if (!collection.shareCode) {
    let code = generateShareCode();
    while (await Collection.exists({ shareCode: code })) {
      code = generateShareCode();
    }
    collection.shareCode = code;
  }

  // Sharing implies the collection should be viewable via the link.
  collection.isPublic = true;
  await collection.save();

  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

  res.status(200).json({
    success: true,
    data: {
      shareCode: collection.shareCode,
      url: `${clientOrigin}/share/${collection.shareCode}`,
    },
  });
});

/**
 * GET /api/share/:code
 * Publicly fetch a shared collection (no auth). Returns 404 if the code is
 * unknown and 403 if the collection has since been made private.
 */
const getSharedCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({
    shareCode: req.params.code,
  }).populate("images");

  if (!collection) {
    throw new ApiError(404, "Share code not found");
  }
  if (!collection.isPublic) {
    throw new ApiError(403, "This collection is private");
  }

  res.status(200).json({ success: true, data: collection });
});

module.exports = { shareCollection, getSharedCollection };
