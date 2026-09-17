const Collection = require("../models/Collection");
const Image = require("../models/Image");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");

/**
 * GET /api/collections
 * Return every collection, newest first, with its images populated.
 */
const getCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find()
    .sort({ createdAt: -1 })
    .populate("images");

  res.status(200).json({ success: true, data: collections });
});

/**
 * POST /api/collections
 * Create a new collection. `name` is required (non-empty, <= 100 chars).
 */
const createCollection = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "name is required");
  }

  const collection = await Collection.create({
    name: name.trim(),
    description: description ? description.trim() : "",
  });

  res.status(201).json({ success: true, data: collection });
});

/**
 * DELETE /api/collections/:id
 * Delete a collection and clean up the images it owned so we don't
 * leave orphaned image documents behind.
 */
const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  // Remove the images belonging to this collection, then the collection itself.
  await Image.deleteMany({ _id: { $in: collection.images } });
  await collection.deleteOne();

  res.status(200).json({ success: true, message: "Collection deleted" });
});

/**
 * PATCH /api/collections/:id/toggle-public
 * Flip a collection between public and private.
 */
const togglePublic = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  collection.isPublic = !collection.isPublic;
  await collection.save();

  res.status(200).json({
    success: true,
    data: { _id: collection._id, isPublic: collection.isPublic },
  });
});

module.exports = {
  getCollections,
  createCollection,
  deleteCollection,
  togglePublic,
};
