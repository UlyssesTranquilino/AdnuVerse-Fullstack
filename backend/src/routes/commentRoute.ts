import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import { CommentController } from "../controller/commentController";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

// Add a comment to a post
router.post(
  "/post/:postId/comment",
  authenticateJWT,
  CommentController.addCommentToPost
);

// Add a comment to a reel
router.post(
  "/reel/:reelId/comment",
  authenticateJWT,
  CommentController.addCommentToReel
);

// Update a comment
router.put("/:commentId", authenticateJWT, CommentController.updateComment);

// Get all comments for a post
router.get(
  "/post/:postId/comments",
  authenticateJWT,
  CommentController.getCommentsForPost
);

// Get all comments for a reel
router.get(
  "/reel/:reelId/comments",
  authenticateJWT,
  CommentController.getCommentsForReel
);

// Delete a comment (only the author or admin can delete)
router.delete("/:commentId", authenticateJWT, CommentController.deleteComment);

// router.delete('/:commentId', authenticateJWT, isAdmin, CommentController.deleteComment);

export default router;
