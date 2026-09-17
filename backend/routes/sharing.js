const express = require("express");
const {
  shareCollection,
  getSharedCollection,
} = require("../controllers/shareController");

// Mounted at /api. Keeps both sharing-related routes together even though
// they live on different resource paths.
const router = express.Router();

// POST /api/collections/:id/share -> generate a public share link
router.post("/collections/:id/share", shareCollection);

// GET /api/share/:code            -> view a shared collection (no auth)
router.get("/share/:code", getSharedCollection);

module.exports = router;
