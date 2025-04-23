import request from "supertest"
import { app } from "../app.js"
import { setupTestDb, cleanupTestDb, closeDbConnection } from "./setup/db-setup.js"
import { createTestUser, loginTestUser, createTestNotification } from "./helpers/test-helpers.js"

// Setup and teardown
beforeAll(async () => {
  await setupTestDb()
})

afterAll(async () => {
  await closeDbConnection()
})

beforeEach(async () => {
  await cleanupTestDb()
})

describe("Notifications", () => {
  let senderToken, receiverToken
  let senderId, receiverId

  // Create test users before each test
  beforeEach(async () => {
    // Create sender
    await createTestUser("sender", "password123")
    senderToken = await loginTestUser("sender", "password123")
    const senderResponse = await request(app).get("/users/all").set("Authorization", `Bearer ${senderToken}`)
    senderId = senderResponse.body.find((user) => user.username === "sender").id

    // Create receiver
    await createTestUser("receiver", "password123")
    receiverToken = await loginTestUser("receiver", "password123")
    const receiverResponse = await request(app).get("/users/all").set("Authorization", `Bearer ${receiverToken}`)
    receiverId = receiverResponse.body.find((user) => user.username === "receiver").id
  })

  describe("Send Notification", () => {
    test("should send a notification successfully", async () => {
      const response = await request(app)
        .post("/notifications/send")
        .set("Authorization", `Bearer ${senderToken}`)
        .send({
          senderId,
          receiverId,
          message: "Test notification",
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("message", "Notification sent successfully")
      expect(response.body).toHaveProperty("notification")
      expect(response.body.notification).toHaveProperty("id")
      expect(response.body.notification).toHaveProperty("sender_id", senderId)
      expect(response.body.notification).toHaveProperty("receiver_id", receiverId)
      expect(response.body.notification).toHaveProperty("message", "Test notification")
      expect(response.body.notification).toHaveProperty("is_read", false)
    })

    test("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/notifications/send")
        .set("Authorization", `Bearer ${senderToken}`)
        .send({
          senderId,
          // Missing receiverId
          message: "Test notification",
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("error", "Sender ID, receiver ID, and message are required")
    })

    test("should return 400 if message is too long", async () => {
      // Create a message longer than 255 characters
      const longMessage = "a".repeat(256)

      const response = await request(app)
        .post("/notifications/send")
        .set("Authorization", `Bearer ${senderToken}`)
        .send({
          senderId,
          receiverId,
          message: longMessage,
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("error", "Message must be less than 255 characters")
    })

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).post("/notifications/send").send({
        senderId,
        receiverId,
        message: "Test notification",
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error", "Authentication token required")
    })
  })

  describe("Get Notifications", () => {
    beforeEach(async () => {
      // Create some test notifications
      await createTestNotification(senderToken, senderId, receiverId, "Notification 1")
      await createTestNotification(senderToken, senderId, receiverId, "Notification 2")
      await createTestNotification(senderToken, senderId, receiverId, "Notification 3")
    })

    test("should get all notifications for the user", async () => {
      const response = await request(app).get("/notifications").set("Authorization", `Bearer ${receiverToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("notifications")
      expect(Array.isArray(response.body.notifications)).toBe(true)
      expect(response.body.notifications.length).toBe(3)
      expect(response.body.notifications[0]).toHaveProperty("message", "Notification 3") // Most recent first
      expect(response.body.notifications[1]).toHaveProperty("message", "Notification 2")
      expect(response.body.notifications[2]).toHaveProperty("message", "Notification 1")
    })

    test("should support pagination", async () => {
      // Create more notifications to test pagination
      await createTestNotification(senderToken, senderId, receiverId, "Notification 4")
      await createTestNotification(senderToken, senderId, receiverId, "Notification 5")

      // Get first page with 2 items
      const response1 = await request(app)
        .get("/notifications?page=1&limit=2")
        .set("Authorization", `Bearer ${receiverToken}`)

      expect(response1.status).toBe(200)
      expect(response1.body.notifications.length).toBe(2)
      expect(response1.body.pagination).toHaveProperty("page", 1)
      expect(response1.body.pagination).toHaveProperty("limit", 2)
      expect(response1.body.pagination).toHaveProperty("hasMore", true)

      // Get second page
      const response2 = await request(app)
        .get("/notifications?page=2&limit=2")
        .set("Authorization", `Bearer ${receiverToken}`)

      expect(response2.status).toBe(200)
      expect(response2.body.notifications.length).toBe(2)
      expect(response2.body.pagination).toHaveProperty("page", 2)
      expect(response2.body.pagination).toHaveProperty("hasMore", true)

      // Get third page
      const response3 = await request(app)
        .get("/notifications?page=3&limit=2")
        .set("Authorization", `Bearer ${receiverToken}`)

      expect(response3.status).toBe(200)
      expect(response3.body.notifications.length).toBe(1)
      expect(response3.body.pagination).toHaveProperty("page", 3)
      expect(response3.body.pagination).toHaveProperty("hasMore", false)
    })

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/notifications")

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error", "Authentication token required")
    })
  })

  describe("Mark Notification as Read", () => {
    let notificationId

    beforeEach(async () => {
      // Create a test notification
      const notificationResponse = await createTestNotification(senderToken, senderId, receiverId, "Test notification")
      notificationId = notificationResponse.notification.id
    })

    test("should mark a notification as read", async () => {
      const response = await request(app)
        .put(`/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${receiverToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("message", "Notification marked as read")

      // Verify the notification is marked as read
      const getResponse = await request(app).get("/notifications").set("Authorization", `Bearer ${receiverToken}`)

      const notification = getResponse.body.notifications.find((n) => n.id === notificationId)
      expect(notification).toHaveProperty("is_read", true)
    })

    test("should return 404 if notification does not exist", async () => {
      const response = await request(app).put("/notifications/999/read").set("Authorization", `Bearer ${receiverToken}`)

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty("error", "Notification not found")
    })

    test("should return 403 if user tries to mark someone else's notification as read", async () => {
      // Create a third user
      await createTestUser("thirduser", "password123")
      const thirdUserToken = await loginTestUser("thirduser", "password123")

      // Try to mark the notification as read with the third user's token
      const response = await request(app)
        .put(`/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${thirdUserToken}`)

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty("error", "Unauthorized access to this notification")
    })

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).put(`/notifications/${notificationId}/read`)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error", "Authentication token required")
    })
  })

  describe("Mark All Notifications as Read", () => {
    beforeEach(async () => {
      // Create multiple test notifications
      await createTestNotification(senderToken, senderId, receiverId, "Notification 1")
      await createTestNotification(senderToken, senderId, receiverId, "Notification 2")
      await createTestNotification(senderToken, senderId, receiverId, "Notification 3")
    })

    test("should mark all notifications as read", async () => {
      const response = await request(app).put("/notifications/read-all").set("Authorization", `Bearer ${receiverToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("message", "All notifications marked as read")

      // Verify all notifications are marked as read
      const getResponse = await request(app).get("/notifications").set("Authorization", `Bearer ${receiverToken}`)

      const unreadNotifications = getResponse.body.notifications.filter((n) => !n.is_read)
      expect(unreadNotifications.length).toBe(0)
    })

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).put("/notifications/read-all")

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error", "Authentication token required")
    })
  })
})
