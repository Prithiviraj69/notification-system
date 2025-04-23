import {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getNotificationById,
  } from "../models/Notification.js"
  import { findUserById } from "../models/User.js"
  import { getSocketInstance } from "../services/socketService.js"
  
  // Send a notification
  export const sendNotification = async (req, res) => {
    try {
      const { senderId, receiverId, message } = req.body
  
      // Validate input
      if (!senderId || !receiverId || !message) {
        return res.status(400).json({ error: "Sender ID, receiver ID, and message are required" })
      }
  
      if (message.length > 255) {
        return res.status(400).json({ error: "Message must be less than 255 characters" })
      }
  
      // Check if sender exists
      const sender = await findUserById(senderId)
      if (!sender) {
        return res.status(404).json({ error: "Sender not found" })
      }
  
      // Check if receiver exists
      const receiver = await findUserById(receiverId)
      if (!receiver) {
        return res.status(404).json({ error: "Receiver not found" })
      }
  
      // Create notification in database
      const notification = await createNotification(senderId, receiverId, message)
  
      // Send real-time notification if receiver is online
      const io = getSocketInstance()
      const receiverSocketId = global.connectedUsers[receiverId]
  
      if (receiverSocketId) {
        console.log(`Sending real-time notification to user ${receiverId} with socket ID ${receiverSocketId}`)
        io.to(receiverSocketId).emit("new_notification", {
          id: notification.id,
          senderId,
          senderUsername: sender.username,
          message,
          createdAt: notification.created_at,
        })
      } else {
        console.log(`User ${receiverId} is not connected, notification saved to database only`)
      }
  
      res.status(201).json({
        message: "Notification sent successfully",
        notification,
      })
    } catch (error) {
      console.error("Send notification error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
  
  // Get all notifications for a user
  export const getNotifications = async (req, res) => {
    try {
      const userId = req.user.userId
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit
  
      console.log(`Getting notifications for user ${userId}, page ${page}, limit ${limit}`)
      const notifications = await getUserNotifications(userId, limit, offset)
      console.log(`Found ${notifications.length} notifications`)
  
      res.status(200).json({
        notifications,
        pagination: {
          page,
          limit,
          hasMore: notifications.length === limit,
        },
      })
    } catch (error) {
      console.error("Get notifications error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
  
  // Mark a notification as read
  export const markAsRead = async (req, res) => {
    try {
      const notificationId = req.params.id
      const userId = req.user.userId
  
      // Check if notification exists and belongs to the user
      const notification = await getNotificationById(notificationId)
  
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" })
      }
  
      if (notification.receiver_id !== userId) {
        return res.status(403).json({ error: "Unauthorized access to this notification" })
      }
  
      await markNotificationAsRead(notificationId)
  
      res.status(200).json({ message: "Notification marked as read" })
    } catch (error) {
      console.error("Mark notification as read error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
  
  // Mark all notifications as read
  export const markAllAsRead = async (req, res) => {
    try {
      const userId = req.user.userId
  
      await markAllNotificationsAsRead(userId)
  
      res.status(200).json({ message: "All notifications marked as read" })
    } catch (error) {
      console.error("Mark all notifications as read error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
  
  // Render dashboard page
  export const renderDashboard = (req, res) => {
    res.render("dashboard", { title: "Dashboard", user: req.user })
  }
  