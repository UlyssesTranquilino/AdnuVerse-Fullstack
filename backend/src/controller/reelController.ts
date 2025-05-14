// controller/reelController.ts
import { Request, Response, NextFunction } from "express";
import { ReelModel } from "../models/Reel.model";
import { IUser, UserModel } from "../models/User.model";
import { Types } from 'mongoose';
import { NotificationModel } from "../models/notification.model";
// Create a new reel
// controller/reelController.ts
const createReel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { videoUrl, caption, visibility, tags, relatedCourse } = req.body;
    const user = (req as Request & { user: IUser }).user; // Get logged-in user from JWT

    const newReel = new ReelModel({
      user: user._id,
      videoUrl,
      caption,
      visibility,
      tags,
      relatedCourse,
    });

    console.log("NEW REEL: ", newReel);

    await newReel.save();

    // Notify followers of the new reel
    const followers = await UserModel.find({ following: user._id }); // Find users following this user
    followers.forEach(async (follower) => {
      const notification = new NotificationModel({
        recipient: follower._id,
        sender: user._id,
        type: 'follow',
        reference: { type: 'Reel', id: newReel._id },
        seen: false,
      });
      await notification.save();
    });

    res.status(201).json({ success: true, data: newReel });
  } catch (error) {
    console.error("Error creating reel:", error);
    next(error);
  }
};

// Get all reels
const getAllReels = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reels = await ReelModel.find().populate("user");

    res.status(200).json({ success: true, data: reels });
  } catch (error) {
    console.error("Error fetching reels:", error);
    next(error);
  }
};

// Update a reel
const updateReel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { videoUrl, caption, visibility, tags } = req.body;
    const user = (req as Request & { user: IUser }).user;

    const reel = await ReelModel.findById(id);
    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" });
      return;
    }

    if (reel.user.toString() !== user._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: "Unauthorized to update this reel" });
      return;
    }

    reel.videoUrl = videoUrl || reel.videoUrl;
    reel.caption = caption || reel.caption;
    reel.visibility = visibility || reel.visibility;
    reel.tags = tags || reel.tags;

    await reel.save();
    res.status(200).json({ success: true, data: reel });
  } catch (error) {
    console.error("Error updating reel:", error);
    next(error);
  }
};

// Delete a reel
const deleteReel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as Request & { user: IUser }).user;

    const reel = await ReelModel.findById(id);
    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" });
      return;
    }

    // Ensure the logged-in user is the author or an admin
    if (reel.user.toString() !== user._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: "Unauthorized to delete this reel" });
      return;
    }

    // Use findByIdAndDelete instead of remove
    await ReelModel.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Reel deleted successfully" });
  } catch (error) {
    console.error("Error deleting reel:", error);
    next(error);
  }
};

// Increment views when a reel is watched
const incrementViews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const reel = await ReelModel.findById(id);
    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" });
      return;
    }

    reel.views += 1;
    await reel.save();

    res.status(200).json({ success: true, data: reel });
  } catch (error) {
    console.error("Error incrementing views:", error);
    next(error);
  }
};

const likeReel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reelId } = req.params;
    const user = (req as Request & { user: IUser }).user;

    console.log("reelId:", reelId);  // Debugging reelId
    console.log("User ID:", user._id);  // Debugging user ID

    if (!Types.ObjectId.isValid(reelId)) {
      res.status(400).json({ success: false, error: 'Invalid reel ID' });
      return;
    }

    const reel = await ReelModel.findById(reelId);
    if (!reel) {
      res.status(404).json({ success: false, error: 'Reel not found' });
      return;
    }

    const userId = new Types.ObjectId(user._id);
    console.log("userId as ObjectId:", userId);

    const userIndex = reel.likes.indexOf(userId);
    console.log("User index in likes array:", userIndex);

    if (userIndex > -1) {
      reel.likes.splice(userIndex, 1);
      await reel.save();
      res.status(200).json({ success: true, message: 'Like removed', data: reel });
    } else {
      reel.likes.push(userId);
      await reel.save();

      const reelOwner = await UserModel.findById(reel.user);
      if (reelOwner) {
        const newNotification = new NotificationModel({
          recipient: reelOwner._id,
          sender: user._id,
          type: 'like',
          reference: { type: 'Reel', id: reel._id },
          seen: false,
          createdAt: new Date(),
        });
        await newNotification.save();
      }

      res.status(200).json({ success: true, message: 'Reel liked', data: reel });
    }
  } catch (error) {
    console.error('Error liking/unliking reel:', error);
    next(error);
  }
};




// Export ReelController object
export const ReelController = {
  createReel,
  getAllReels,
  updateReel,
  deleteReel,
  incrementViews,
  likeReel,
};
