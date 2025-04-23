import express from "express"
import {
  sendNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  renderDashboard,
} from "../controllers/notificationController.js"
import { authenticateToken, isAuthenticated } from "../middleware/authMiddleware.js"

const router = express.Router()

// API routes
router.post("/send", authenticateToken, sendNotification)
router.get("/", authenticateToken, getNotifications)
router.put("/:id/read", authenticateToken, markAsRead)
router.put("/read-all", authenticateToken, markAllAsRead)

// Web routes
router.get("/dashboard", isAuthenticated, renderDashboard)

export default router
