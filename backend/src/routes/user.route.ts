// src/routes/user.routes.ts

import express from "express";
import { UserController } from "../controller/userController"; // Import UserController
import { authenticateJWT } from "../middleware/authMiddleware"; // Import the JWT authentication middleware

const router = express.Router();

// Routes for user management
router.post("/login", UserController.loginUser);
router.put('/change-password', authenticateJWT, UserController.changePassword);
router.get("/", authenticateJWT, UserController.getAllUsers); // Get all users (protected route)
// router.get("/:email", authenticateJWT, UserController.getUserByEmail); // Get user by email (protected route)
router.post("/create", UserController.createUser); // Create a new user (open route)
router.delete("/:id", authenticateJWT, UserController.deleteUser); // Delete user by ID (protected route)
router.put("/:id", authenticateJWT, UserController.updateUser); // Update user by ID (protected route)
router.get("/:id", authenticateJWT, UserController.getUserById);

router.post("/:userId/follow", authenticateJWT, UserController.followUser); // Follow a user
router.post("/:userId/unfollow", authenticateJWT, UserController.unfollowUser);

// Get all followers of a user by their ID
router.get("/:id/followers", authenticateJWT, UserController.getAllFollowers);

// Get all users that a user is following by their ID
router.get("/:id/following", authenticateJWT, UserController.getAllFollowing);

export default router;
