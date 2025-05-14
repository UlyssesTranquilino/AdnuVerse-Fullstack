import mongoose, { Schema, Document } from "mongoose";
import { PostModel } from "./Post.model";
import { ReelModel } from "./Reel.model";

const CommentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "parentModel", // This is the key to handle polymorphic references (Post or Reel)
  },
  parentModel: {
    type: String,
    required: true,
    enum: ["Post", "Reel"], // Determines if the parent is a Post or a Reel
  },
});

const CommentModel = mongoose.model("Comment", CommentSchema);
export { CommentModel };
