import { Router } from 'express';
import { NotificationController } from '../controller/notificationController';
import { authenticateJWT } from '../middleware/authMiddleware';
const router = Router();

// Route to get all notifications for a user
router.get('/:userId',  authenticateJWT,NotificationController.getNotificationsByUserId);

// Route to mark a notification as seen
router.put('/:notificationId/seen',  authenticateJWT,NotificationController.markNotificationAsSeen);

// Route to delete a notification
router.delete('/:notificationId', authenticateJWT, NotificationController.deleteNotification);
router.delete("/user/:userId", authenticateJWT, NotificationController.deleteAllNotificationsByUserId);
export default router;
