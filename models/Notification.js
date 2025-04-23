import pool from "../config/db.js"

// Create a new notification
export const createNotification = async (senderId, receiverId, message) => {
  const query = `
    INSERT INTO notifications (sender_id, receiver_id, message) 
    VALUES ($1, $2, $3) 
    RETURNING id, sender_id, receiver_id, message, is_read, created_at
  `
  const values = [senderId, receiverId, message]
  const result = await pool.query(query, values)
  return result.rows[0]
}

// Get notifications for a user with pagination
export const getUserNotifications = async (userId, limit, offset) => {
  const query = `
    SELECT n.id, n.message, n.is_read, n.created_at, 
           u.id as sender_id, u.username as sender_username
    FROM notifications n
    JOIN users u ON n.sender_id = u.id
    WHERE n.receiver_id = $1
    ORDER BY n.created_at DESC
    LIMIT $2 OFFSET $3
  `
  const values = [userId, limit, offset]
  const result = await pool.query(query, values)
  return result.rows
}

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  const query = "UPDATE notifications SET is_read = TRUE WHERE id = $1"
  const values = [notificationId]
  await pool.query(query, values)
}

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  const query = "UPDATE notifications SET is_read = TRUE WHERE receiver_id = $1"
  const values = [userId]
  await pool.query(query, values)
}

// Get notification by ID
export const getNotificationById = async (notificationId) => {
  const query = "SELECT * FROM notifications WHERE id = $1"
  const values = [notificationId]
  const result = await pool.query(query, values)
  return result.rows[0]
}

// Count unread notifications
export const countUnreadNotifications = async (userId) => {
  const query = "SELECT COUNT(*) FROM notifications WHERE receiver_id = $1 AND is_read = FALSE"
  const values = [userId]
  const result = await pool.query(query, values)
  return Number.parseInt(result.rows[0].count)
}
