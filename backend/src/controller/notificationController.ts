import { Request, Response, NextFunction } from "express";
import { NotificationModel } from "../models/notification.model";
import { IUser, UserModel } from "../models/User.model";
import { Types } from "mongoose";

// Get all notifications for a specific user by ID
const getNotificationsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const notifications = await NotificationModel.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "username avatar email firstName lastName") // Include desired fields from sender
      .populate("recipient", "username avatar email firstName lastName"); // Optional, if you also want recipient info

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    next(error);
  }
};

// Mark a notification as seen
const markNotificationAsSeen = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { notificationId } = req.params; // Get notification ID from params

    // Find the notification by ID
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      res.status(404).json({ success: false, error: "Notification not found" });
      return;
    }

    // Mark the notification as seen
    notification.seen = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as seen",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    next(error); // Pass error to global error handler
  }
};

// Delete a notification
const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { notificationId } = req.params; // Get notification ID from params

    // Find the notification by ID and delete it
    const notification = await NotificationModel.findByIdAndDelete(
      notificationId
    );
    if (!notification) {
      res.status(404).json({ success: false, error: "Notification not found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    next(error); // Pass error to global error handler
  }
};
const deleteAllNotificationsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId; // Get user ID from params

    // Find and delete all notifications for the user
    const result = await NotificationModel.deleteMany({ recipient: new Types.ObjectId(userId) });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, error: "No notifications found for the user" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    next(error); // Pass error to global error handler
  }
};
// Export NotificationController
export const NotificationController = {
  getNotificationsByUserId,
  markNotificationAsSeen,
  deleteNotification,
  deleteAllNotificationsByUserId
};
