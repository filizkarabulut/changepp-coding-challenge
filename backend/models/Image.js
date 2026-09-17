const mongoose = require("mongoose");

// A simple URL sanity check. Accepts http(s) URLs, which is all we expect
// from image providers like Pixabay. Kept intentionally lenient.
const URL_REGEX = /^https?:\/\/.+/i;

/**
 * Image schema.
 * An image is a single saved piece of content that lives inside a collection.
 */
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image url is required"],
      trim: true,
      validate: {
        validator: (value) => URL_REGEX.test(value),
        message: "url must be a valid http(s) URL",
      },
    },
    title: {
      type: String,
      required: [true, "Image title is required"],
      trim: true,
      maxlength: [200, "title cannot exceed 200 characters"],
    },
    source: {
      type: String,
      trim: true,
      maxlength: [50, "source cannot exceed 50 characters"],
    },
    width: {
      type: Number,
      min: [0, "width cannot be negative"],
    },
    height: {
      type: Number,
      min: [0, "height cannot be negative"],
    },
  },
  {
    // Automatically manage createdAt (and updatedAt) timestamps.
    timestamps: true,
  }
);

module.exports = mongoose.model("Image", imageSchema);
