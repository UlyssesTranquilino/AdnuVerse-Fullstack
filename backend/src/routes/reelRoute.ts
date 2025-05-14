// src/routes/reelRoute.ts
import express from "express";
import { ReelController } from "../controller/reelController"; // Import controller
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateJWT, ReelController.createReel);
router.put("/:id", authenticateJWT, ReelController.updateReel);
router.delete("/:id", authenticateJWT, ReelController.deleteReel);
router.get("/", ReelController.getAllReels);
router.post("/:id/view",authenticateJWT, ReelController.incrementViews);
router.post("/:reelId/like", authenticateJWT, ReelController.likeReel);
// router.get('/', authenticateJWT, ReelController.getAllReels);
export default router; // Ensure you export the router
