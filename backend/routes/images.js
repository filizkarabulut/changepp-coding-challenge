const express = require("express");
const { addImage, removeImage } = require("../controllers/imageController");

// mergeParams lets this nested router read :collectionId from the parent path
// (mounted under /api/collections/:collectionId/images).
const router = express.Router({ mergeParams: true });

// POST /api/collections/:collectionId/images        -> add an image
router.post("/", addImage);

// DELETE /api/collections/:collectionId/images/:imageId -> remove an image
router.delete("/:imageId", removeImage);

module.exports = router;
