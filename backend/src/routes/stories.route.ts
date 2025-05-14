// routes/storyRoutes.ts
import express from "express";
import { StoryController } from "../controller/storiesController";
import { authenticateJWT } from "../middleware/authMiddleware"; // Assuming you have a middleware for authentication

const router = express.Router();

// Define routes for Stories
router.post("/create",  authenticateJWT, StoryController.createStory);  // Create a new story
router.post("/:storyId/like", authenticateJWT, StoryController.likeStory);
router.get("/", StoryController.getAllStories);                    // Get all stories
router.get("/:id", StoryController.getStoryById);                  // Get a single story by ID
router.get("/user/:userId", StoryController.getAllStoriesFromUser); // Get all stories from a specific user
router.delete("/:id",  authenticateJWT, StoryController.deleteStory);  // Delete a story by ID
router.put("/:id/views", StoryController.incrementViews);          // Increment views for a story

export default router;
