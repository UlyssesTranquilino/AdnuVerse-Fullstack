import express from "express";
import { PostController } from "../controller/postController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

// Routes for creating, updating, deleting posts
router.post("/", authenticateJWT, PostController.createPost);
router.put("/:id", authenticateJWT, PostController.updatePost);
router.delete("/:id", authenticateJWT, PostController.deletePost);
router.get("/", PostController.getAllPosts); // Get all posts (no authentication required)
router.post("/:postId/like", authenticateJWT, PostController.likePost); // Like a post
router.get("/:id", authenticateJWT, PostController.getPostById);
router.get("/user/:userId", authenticateJWT, PostController.getPostsByUser); // Add this line

export default router;
