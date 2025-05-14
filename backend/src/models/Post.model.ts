import mongoose from "mongoose";

// Post Schema
const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
  text: {
    type: String,
    required: false, // Post text is required
  },
  media: [
    {
      type: String, // Array to store media URLs (image/video)
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Array of User IDs who liked the post
      default: [],
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // Array of Comment IDs
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Default timestamp for post creation
  },
  visibility: {
    type: String,
    enum: ["public", "department-only", "followers-only"],
    default: "public", // Default visibility to public
  },
  tags: [
    {
      type: String, // Array to store tags associated with the post
      default: "",
    },
  ],
  relatedCourse: {
    type: String,
    default: "", // Default value if none is selected
  },
});

export const PostModel = mongoose.model("Post", PostSchema);
