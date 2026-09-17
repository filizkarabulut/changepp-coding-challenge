const express = require("express");
const {
  getCollections,
  createCollection,
  deleteCollection,
  togglePublic,
} = require("../controllers/collectionController");
const imageRouter = require("./images");

const router = express.Router();

// GET  /api/collections        -> list all collections
// POST /api/collections        -> create a collection
router.route("/").get(getCollections).post(createCollection);

// DELETE /api/collections/:id   -> delete a collection
router.delete("/:id", deleteCollection);

// PATCH /api/collections/:id/toggle-public -> flip public/private
router.patch("/:id/toggle-public", togglePublic);

// Nested image routes: /api/collections/:collectionId/images...
router.use("/:collectionId/images", imageRouter);

module.exports = router;
