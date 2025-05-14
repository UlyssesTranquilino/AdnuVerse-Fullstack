import { Request, Response, NextFunction } from "express";
import {
  getUsers,
  getUserByEmail,
  createUser,
  deleteUserById,
  updateUserById,
  getUserById,
} from "../queries/userQueries";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../utils/jwt";
import { IUser } from "../models/User.model";
import { UserModel } from "../models/User.model";
import { Types } from "mongoose";
import { NotificationModel } from "../models/notification.model";

export const UserController = {
  // Get all users
  getAllUsers: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as Request & { user: any }).user; // Cast `req.user` as `any`
      console.log("User info from JWT:", user); // Access user data from JWT

      const users = await getUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Get user by email
  getUserByEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.params;
      const user = (req as Request & { user: any }).user; // Cast `req.user` as `any`
      console.log("User info from JWT:", user); // Access user data from JWT

      const token = req.headers["authorization"]?.split(" ")[1]; // Get token from the Authorization header
      if (token) {
        const decoded = verifyToken(token);
        if (!decoded) {
          res
            .status(401)
            .json({ success: false, error: "Invalid or expired token" });
          return;
        }
      }

      const fetchedUser = await getUserByEmail(email);
      if (!fetchedUser) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      res.status(200).json({ success: true, data: fetchedUser });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Create a new user
  createUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Log the entire request body to see the data being sent
      console.log("Request Body:", req.body);

      // Ensure 'firstName' and 'lastName' are in the request body
      const {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        avatar,
        bio,
        backgroundImage,
        department,
        batchYear,
        studentId,
        orgs,
      } = req.body;

      // Validation check to ensure required fields are present
      if (!firstName || !lastName || !username || !email || !password) {
        res.status(400).json({
          success: false,
          error: "First and last names are required.",
        });
        return;
      }

      // If all required fields are valid, continue with user creation...
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ success: false, error: "Email already exists" });
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const userData = {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        role,
        avatar,
        bio,
        backgroundImage,
        department,
        batchYear,
        studentId,
        orgs,
      };

      const newUser = await createUser(userData);
      if (!newUser) {
        res
          .status(500)
          .json({ success: false, error: "Failed to create user" });
        return;
      }

      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      next(error);
    }
  },

  // Delete user by ID
  deleteUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedUser = await deleteUserById(id); // Delete user by ID
      if (!deletedUser) {
        res.status(404).json({ success: false, error: "User not found." });
        return;
      }
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully." });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Update user information
  updateUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      // Check if password is being updated, and if so, hash it
      if (updatedData.password) {
        const salt = bcrypt.genSaltSync(10);
        updatedData.password = bcrypt.hashSync(updatedData.password, salt);
      }

      const updatedUser = await updateUserById(id, updatedData); // Update user by ID
      if (!updatedUser) {
        res.status(404).json({ success: false, error: "User not found." });
        return;
      }

      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Login user (for JWT token generation)
  loginUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Check if the email and password are provided
      if (!email || !password) {
        res
          .status(400)
          .json({ success: false, error: "Email and password are required" });
        return;
      }

      // Fetch the user by email
      const user = await getUserByEmail(email);
      if (!user) {
        res
          .status(401)
          .json({ success: false, error: "Invalid email or password" });
        return;
      }

      // Typecast the user to IUser to ensure proper type checking
      const typedUser = user as IUser; // Explicitly cast user as IUser

      // Check if the user has a password
      if (!typedUser.password) {
        res
          .status(401)
          .json({ success: false, error: "Invalid email or password" });
        return;
      }

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(
        password,
        typedUser.password
      );
      if (!isPasswordValid) {
        res
          .status(401)
          .json({ success: false, error: "Invalid email or password" });
        return;
      }

      // Generate JWT token using typedUser._id (now properly typed)
      const token = generateToken(typedUser._id.toString(), typedUser.role); // Now we can safely access _id
      const { password: _, ...safeUser } = typedUser.toObject();
      // Return the token in the response
      res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        user: safeUser,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      next(error);
    }
  },

  // Get user by ID
  getUserById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      console.log("USER: ", id);

      const user = await getUserById(id); // Call the query function

      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      next(error);
    }
  },

  // Follow user
  followUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params; // userId from params (string)
      const tokenUserId = (req as Request & { user: IUser }).user._id; // User ID from JWT token

      const currentUser = await UserModel.findById(tokenUserId);
      if (!currentUser) {
        res
          .status(404)
          .json({ success: false, error: "Current user not found" });
        return;
      }

      // Ensure they are not trying to follow themselves
      if (userId === currentUser._id.toString()) {
        res
          .status(400)
          .json({ success: false, error: "You cannot follow yourself" });
        return;
      }

      const userToFollow = await UserModel.findById(new Types.ObjectId(userId));
      if (!userToFollow) {
        res
          .status(404)
          .json({ success: false, error: "User to follow not found" });
        return;
      }

      // Check if the current user is already following the target user
      if (
        currentUser.following.some((following) =>
          following.equals(userToFollow._id)
        )
      ) {
        res
          .status(400)
          .json({ success: false, error: "Already following this user" });
        return;
      }

      // Add to followers and following lists
      userToFollow.followers.push(currentUser._id);
      currentUser.following.push(userToFollow._id);

      // Save the updated users
      await userToFollow.save();
      await currentUser.save();

      // Create notification for follow
      const notification = new NotificationModel({
        recipient: userToFollow._id,
        sender: currentUser._id,
        type: "follow",
        reference: { type: "User", id: currentUser._id },
        seen: false,
        createdAt: new Date(),
      });
      await notification.save();

      res.status(200).json({
        success: true,
        message: "Followed successfully",
        data: userToFollow,
      });
    } catch (error) {
      console.error("Error following user:", error);
      next(error); // Pass error to global error handler
    }
  },

  // Unfollow user
  unfollowUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params; // userId from params (user to unfollow)
      const tokenUserId = (req as Request & { user: IUser }).user._id; // Current logged-in user ID

      const currentUser = await UserModel.findById(tokenUserId);
      if (!currentUser) {
        res
          .status(404)
          .json({ success: false, error: "Current user not found" });
        return;
      }

      const isFollowing = currentUser.following.some(
        (followingId) => followingId.toString() === userId
      );

      if (!isFollowing) {
        res
          .status(400)
          .json({ success: false, error: "Not following this user" });
        return;
      }

      // Proceed with unfollowing the user
      const userToUnfollow = await UserModel.findById(userId);
      if (!userToUnfollow) {
        res
          .status(404)
          .json({ success: false, error: "User to unfollow not found" });
        return;
      }

      // Remove the user from the currentUser's following list
      currentUser.following = currentUser.following.filter(
        (followingId) => followingId.toString() !== userId
      );

      // Remove the currentUser from the userToUnfollow's followers list
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (followerId) => followerId.toString() !== currentUser._id.toString()
      );

      // Save both users' updated data
      await currentUser.save();
      await userToUnfollow.save();

      // Create notification for unfollow action
      const notification = new NotificationModel({
        recipient: userToUnfollow._id,
        sender: currentUser._id,
        type: "unfollow", // Changed to 'unfollow' type
        reference: { type: "User", id: currentUser._id }, // Reference is the currentUser (who unfollowed)
        seen: false,
        createdAt: new Date(),
      });
      await notification.save();

      res
        .status(200)
        .json({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      next(error); // Pass error to global error handler
    }
  },

  // Get all followers for a specific user by ID
  getAllFollowers: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params; // Get user ID from params
      const user = await UserModel.findById(id).populate("followers"); // Populate the followers

      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      res.status(200).json({ success: true, data: user.followers }); // Return followers
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  // Get all following for a specific user by ID
  getAllFollowing: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params; // Get user ID from params
      const user = await UserModel.findById(id).populate("following"); // Populate the following list

      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      res.status(200).json({ success: true, data: user.following }); // Return following users
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  changePassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      // Validate if all necessary fields are provided
      if (!oldPassword || !newPassword || !confirmNewPassword) {
        res.status(400).json({
          success: false,
          error: "Old password, new password, and confirm new password are required.",
        });
        return;
      }

      // Validate if new password and confirm new password match
      if (newPassword !== confirmNewPassword) {
        res.status(400).json({
          success: false,
          error: "New password and confirm new password do not match.",
        });
        return;
      }

      const tokenUserId = (req as Request & { user: any }).user._id;

      // Fetch the user from the database using the token's user ID
      const user = await UserModel.findById(tokenUserId);
      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      // Check if oldPassword is valid and not undefined
      if (typeof oldPassword !== "string") {
        res.status(400).json({
          success: false,
          error: "Old password must be a string and cannot be undefined.",
        });
        return;
      }

      // If user is using Google authentication, password won't be available
      if (user.googleAuth) {
        res.status(400).json({
          success: false,
          error: "User cannot change password as they are authenticated with Google.",
        });
        return;
      }

      // Ensure user.password is defined before comparing
      if (typeof user.password !== "string") {
        res.status(400).json({
          success: false,
          error: "User password is not valid.",
        });
        return;
      }

      // Check if the old password provided matches the stored hashed password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        res.status(400).json({
          success: false,
          error: "Old password is incorrect.",
        });
        return;
      }

      // Proceed to change the password if the old password is valid
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();

      res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
      next(error);
    }
  },
};
