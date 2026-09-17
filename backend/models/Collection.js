const mongoose = require("mongoose");

/**
 * Collection schema.
 * A collection is a named group of images (like a board on Pinterest).
 * Images are stored as references so they can be populated on demand.
 */
const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
      maxlength: [100, "name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "description cannot exceed 500 characters"],
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareCode: {
      type: String,
      // `sparse` lets many documents omit shareCode while still enforcing
      // uniqueness on the ones that have it.
      unique: true,
      sparse: true,
      minlength: 8,
      maxlength: 8,
    },
  },
  {
    // Automatically manage createdAt / updatedAt timestamps.
    timestamps: true,
    // Include virtuals (like imageCount) when converting to JSON.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Convenience virtual so responses can report how many images a collection has
// without the client having to count the array itself.
collectionSchema.virtual("imageCount").get(function () {
  return Array.isArray(this.images) ? this.images.length : 0;
});

module.exports = mongoose.model("Collection", collectionSchema);
