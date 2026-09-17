const Collection = require("../models/Collection");
const Image = require("../models/Image");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");

const URL_REGEX = /^https?:\/\/.+/i;

/**
 * POST /api/collections/:collectionId/images
 * Create an image and add it to the given collection.
 * `url` and `title` are required; `url` must look like an http(s) URL.
 */
const addImage = asyncHandler(async (req, res) => {
  const { url, title, source, width, height } = req.body;

  // Validate required fields up front for clear 400s.
  if (!url || !url.trim()) {
    throw new ApiError(400, "url is required");
  }
  if (!title || !title.trim()) {
    throw new ApiError(400, "title is required");
  }
  if (!URL_REGEX.test(url.trim())) {
    throw new ApiError(400, "url must be a valid http(s) URL");
  }

  const collection = await Collection.findById(req.params.collectionId);
  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  // Create the image, then link it to the collection.
  const image = await Image.create({
    url: url.trim(),
    title: title.trim(),
    source: source ? source.trim() : undefined,
    width,
    height,
  });

  collection.images.push(image._id);
  await collection.save();

  res.status(201).json({ success: true, data: image });
});

/**
 * DELETE /api/collections/:collectionId/images/:imageId
 * Remove an image from a collection and delete the image document.
 */
const removeImage = asyncHandler(async (req, res) => {
  const { collectionId, imageId } = req.params;

  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  // Confirm the image actually belongs to this collection before removing.
  const hasImage = collection.images.some((id) => id.equals(imageId));
  if (!hasImage) {
    throw new ApiError(404, "Image not found in this collection");
  }

  collection.images.pull(imageId);
  await collection.save();
  await Image.findByIdAndDelete(imageId);

  res.status(200).json({ success: true, message: "Image removed" });
});

module.exports = { addImage, removeImage };
