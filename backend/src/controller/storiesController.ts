// controller/storyController.ts
import { Request, Response, NextFunction } from "express";
import { StoryModel } from "../models/Stories.model";
import { IUser, UserModel } from "../models/User.model";
import slugify from "slugify";
import { Types } from "mongoose";
import { NotificationModel } from "../models/notification.model";
// Create a new story

// controller/storyController.ts
const createStory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { Type_Of_Story, text, media, visibility, textStyle } = req.body;
    const user = (req as Request & { user: IUser }).user; // Get logged-in user from JWT

    const slug = text?.trim()
      ? slugify(text, { lower: true, strict: true })
      : `story-${Date.now()}`;

    const newStory = new StoryModel({
      user: user._id,
      Type_Of_Story,
      text,
      media,
      visibility,
      textStyle,
      slug,
    });

    console.log("NEW STORY: ", newStory);

    await newStory.save();

    // Notify followers of the new story
    const followers = await UserModel.find({ following: user._id }); // Find users following this user
    followers.forEach(async (follower) => {
      const notification = new NotificationModel({
        recipient: follower._id,
        sender: user._id,
        type: "follow",
        reference: { type: "Story", id: newStory._id },
        seen: false,
      });
      await notification.save();
    });

    res.status(201).json({ success: true, data: newStory });
  } catch (error) {
    console.error("Error creating story:", error);
    next(error);
  }
};

// Like or Unlike a story
const likeStory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storyId } = req.params;
    const user = (req as Request & { user: IUser }).user;

    console.log("storyId:", storyId); // Debugging storyId
    console.log("User ID:", user._id); // Debugging user ID

    if (!Types.ObjectId.isValid(storyId)) {
      res.status(400).json({ success: false, error: "Invalid story ID" });
      return;
    }

    const story = await StoryModel.findById(storyId);
    if (!story) {
      res.status(404).json({ success: false, error: "Story not found" });
      return;
    }

    const userId = new Types.ObjectId(user._id);
    console.log("userId as ObjectId:", userId);

    const userIndex = story.likes.indexOf(userId);
    console.log("User index in likes array:", userIndex);

    if (userIndex > -1) {
      story.likes.splice(userIndex, 1);
      await story.save();
      res
        .status(200)
        .json({ success: true, message: "Like removed", data: story });
    } else {
      story.likes.push(userId);
      await story.save();

      const storyOwner = await UserModel.findById(story.user);
      if (storyOwner) {
        const newNotification = new NotificationModel({
          recipient: storyOwner._id,
          sender: user._id,
          type: "like",
          reference: { type: "Story", id: story._id },
          seen: false,
          createdAt: new Date(),
        });
        await newNotification.save();
      }

      res
        .status(200)
        .json({ success: true, message: "Story liked", data: story });
    }
  } catch (error) {
    console.error("Error liking/unliking story:", error);
    next(error);
  }
};

// Get all stories
const getAllStories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stories = await StoryModel.find().populate("user");

    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    next(error);
  }
};

// Get a story by its ID
const getStoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const story = await StoryModel.findById(id).populate("user");
    if (!story) {
      res.status(404).json({ success: false, error: "Story not found" });
      return;
    }

    res.status(200).json({ success: true, data: story });
  } catch (error) {
    console.error("Error fetching story by ID:", error);
    next(error);
  }
};

// Get all stories from a specific user
const getAllStoriesFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const stories = await StoryModel.find({ user: userId }).populate("user");

    if (!stories.length) {
      res
        .status(404)
        .json({ success: false, error: "No stories found for this user" });
      return;
    }

    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    console.error("Error fetching stories from user:", error);
    next(error);
  }
};

// Delete a story
const deleteStory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as Request & { user: IUser }).user;

    const story = await StoryModel.findById(id);
    if (!story) {
      res.status(404).json({ success: false, error: "Story not found" });
      return;
    }

    if (story.user.toString() !== user._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: "Unauthorized to delete this story" });
      return;
    }

    await StoryModel.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    next(error);
  }
};
const incrementViews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params; // Get the story ID from the URL

    // Find the story by ID
    const story = await StoryModel.findById(id);
    if (!story) {
      res.status(404).json({ success: false, error: "Story not found" });
      return;
    }

    // Increment the views count
    story.views += 1;

    // Save the updated story with the new view count
    await story.save();

    res.status(200).json({ success: true, data: story });
  } catch (error) {
    console.error("Error incrementing views:", error);
    next(error);
  }
};

export const StoryController = {
  createStory,
  getAllStories,
  getStoryById,
  getAllStoriesFromUser,
  deleteStory,
  incrementViews,
  likeStory, // Add like/unlike functionality
};
