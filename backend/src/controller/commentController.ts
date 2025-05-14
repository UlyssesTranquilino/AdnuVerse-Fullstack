import { Request, Response, NextFunction } from "express";
import { PostModel } from "../models/Post.model";
import { ReelModel } from "../models/Reel.model";
import { CommentModel } from "../models/comments.model";
import { IUser, UserModel } from "../models/User.model";
import { Types } from "mongoose"; // Import Types from mongoose for ObjectId conversion
import { NotificationModel } from "../models/notification.model";

// Helper function to check if the logged-in user is the comment's author or an admin
const isAuthorizedToEditOrDelete = (
  userId: Types.ObjectId,
  comment: any
): boolean => {
  // Convert both userId and comment.user to string for comparison
  return (
    comment.user.toString() === userId.toString() ||
    comment.user.role === "admin"
  );
};

// Add a comment to a post
const addCommentToPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body; // Get the comment text from the request body
    const { postId } = req.params; // Get the postId from the URL params

    const user = (req as Request & { user: IUser }).user;

    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    const newComment = new CommentModel({
      user: user._id,
      text,
      parentModel: "Post",
      parent: post._id,
    });

    await newComment.save();
    post.comments.push(newComment._id);
    await post.save();

    // Create notification for the post owner
    const postOwner = await UserModel.findById(post.user);
    if (postOwner) {
      const message = `${user.firstName} commented on your post`;
      const newNotification = new NotificationModel({
        recipient: postOwner._id,
        sender: user._id,
        type: "comment",
        reference: { type: "Post", id: post._id },
        seen: false,
        createdAt: new Date(),
      });
      await newNotification.save();
    }

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("Error adding comment to post:", error);
    next(error);
  }
};

// Add a comment to a reel
const addCommentToReel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reelId, text } = req.body; // Get reelId and comment text from request body
    const user = (req as Request & { user: IUser }).user;

    const reel = await ReelModel.findById(reelId);
    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" });
      return;
    }

    const newComment = new CommentModel({
      user: user._id,
      text,
      parentModel: "Reel",
      parent: reel._id,
    });

    await newComment.save();
    reel.comments.push(newComment._id);
    await reel.save();

    // Create notification for the reel owner
    const reelOwner = await UserModel.findById(reel.user);
    if (reelOwner) {
      const message = `${user.firstName} commented on your reel`;
      const newNotification = new NotificationModel({
        recipient: reelOwner._id,
        sender: user._id,
        type: "comment",
        reference: { type: "Reel", id: reel._id },
        seen: false,
        createdAt: new Date(),
      });
      await newNotification.save();
    }

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("Error adding comment to reel:", error);
    next(error);
  }
};

// Update a comment
const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId, text } = req.body;
    const user = (req as Request & { user: IUser }).user;

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      res.status(404).json({ success: false, error: "Comment not found" });
      return;
    }

    // Ensure that user._id is compared correctly (as an ObjectId)
    if (!isAuthorizedToEditOrDelete(user._id, comment)) {
      res
        .status(403)
        .json({ success: false, error: "Unauthorized to edit this comment" });
      return;
    }

    comment.text = text || comment.text;
    await comment.save();

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    next(error);
  }
};

// Delete a comment
const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const user = (req as Request & { user: IUser }).user;

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      res.status(404).json({ success: false, error: "Comment not found" });
      return;
    }

    console.log("COMMENT: ", comment);
    console.log("USER ID: ", user._id);

    // Ensure that user._id is compared correctly (as an ObjectId)
    if (!isAuthorizedToEditOrDelete(user._id, comment)) {
      res
        .status(403)
        .json({ success: false, error: "Unauthorized to delete this comment" });
      return;
    }

    if (comment.parentModel === "Post") {
      const post = await PostModel.findById(comment.parent);
      if (!post) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
      }

      post.comments = post.comments.filter(
        (commentId) => commentId.toString() !== comment._id.toString()
      );
      await post.save();
    } else if (comment.parentModel === "Reel") {
      const reel = await ReelModel.findById(comment.parent);
      if (!reel) {
        res.status(404).json({ success: false, error: "Reel not found" });
        return;
      }

      reel.comments = reel.comments.filter(
        (commentId) => commentId.toString() !== comment._id.toString()
      );
      await reel.save();
    }

    await CommentModel.findByIdAndDelete(commentId);
    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    next(error);
  }
};

// Get all comments for a post
const getCommentsForPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate({
      path: "comments",
      populate: {
        path: "user",
        model: "User", // use the actual model name if different
      },
    });

    if (!post) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    res.status(200).json({ success: true, data: post.comments });
  } catch (error) {
    console.error("Error fetching comments for post:", error);
    next(error);
  }
};

// Get all comments for a reel
const getCommentsForReel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reelId } = req.params;
    const reel = await ReelModel.findById(reelId).populate({
      path: "comments",
      populate: {
        path: "user",
        model: "User",
      },
    });

    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" });
      return;
    }

    res.status(200).json({ success: true, data: reel.comments });
  } catch (error) {
    console.error("Error fetching comments for reel:", error);
    next(error);
  }
};

// Export controller functions
export const CommentController = {
  addCommentToPost,
  addCommentToReel,
  updateComment,
  deleteComment,
  getCommentsForPost,
  getCommentsForReel,
};
