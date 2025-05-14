// src/models/Reel.model.ts
import mongoose from "mongoose";
import { CommentModel } from "./comments.model"; // Import the Comment model

const ReelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: false,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the Comment model
      ref: "Comment", // Reference to the Comment model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  share: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  visibility: {
    type: String,
    enum: ["public", "department-only", "followers-only"],
    default: "",
  },
  tags: [
    {
      type: String,
      default: "",
    },
  ],
  relatedCourse: {
    type: String,
    default: "",
  },
  views: {
    type: Number,
    default: 0,
  },
});

export const ReelModel = mongoose.model("Reel", ReelSchema);
