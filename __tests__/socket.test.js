import { Server } from "socket.io"
import { io as Client } from "socket.io-client"
import http from "http"
import { setupSocketIO } from "../services/socketService.js"
import { setupTestDb, cleanupTestDb, closeDbConnection } from "./setup/db-setup.js"
import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect } from "@jest/globals"

describe("Socket.IO", () => {
  let io, clientSocket, httpServer

  beforeAll(async () => {
    await setupTestDb()
    httpServer = http.createServer()
    io = new Server(httpServer)
    setupSocketIO(io)
    httpServer.listen(0) // Use any available port
  })

  afterAll(async () => {
    await closeDbConnection()
    io.close()
    httpServer.close()
  })

  beforeEach(async () => {
    await cleanupTestDb()
    clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
      transports: ["websocket"],
      forceNew: true,
    })
    await new Promise((resolve) => {
      clientSocket.on("connect", resolve)
    })
  })

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect()
    }
  })

  test("should connect and authenticate a user", (done) => {
    const userId = 1

    // Set up global.connectedUsers if it doesn't exist
    if (!global.connectedUsers) {
      global.connectedUsers = {}
    }

    // Authenticate the user
    clientSocket.emit("authenticate", userId)

    // Wait a bit to ensure the server processes the authentication
    setTimeout(() => {
      // Check if the user is in the connected users list
      expect(global.connectedUsers[userId]).toBeDefined()
      expect(global.connectedUsers[userId]).toBe(clientSocket.id)
      done()
    }, 100)
  })

  test("should remove user from connected users on disconnect", (done) => {
    const userId = 2

    // Set up global.connectedUsers if it doesn't exist
    if (!global.connectedUsers) {
      global.connectedUsers = {}
    }

    // Authenticate the user
    clientSocket.emit("authenticate", userId)

    // Wait to ensure the server processes the authentication
    setTimeout(() => {
      // Check if the user is in the connected users list
      expect(global.connectedUsers[userId]).toBeDefined()

      // Disconnect the client
      clientSocket.disconnect()

      // Wait to ensure the server processes the disconnect
      setTimeout(() => {
        // Check if the user is removed from the connected users list
        expect(global.connectedUsers[userId]).toBeUndefined()
        done()
      }, 100)
    }, 100)
  })

  test("should receive real-time notification", (done) => {
    const senderId = 3
    const receiverId = 4
    const senderUsername = "sender"
    const message = "Test real-time notification"

    // Authenticate the receiver
    clientSocket.emit("authenticate", receiverId)

    // Listen for new notification
    clientSocket.on("new_notification", (notification) => {
      expect(notification).toHaveProperty("id")
      expect(notification).toHaveProperty("senderId", senderId)
      expect(notification).toHaveProperty("senderUsername", senderUsername)
      expect(notification).toHaveProperty("message", message)
      expect(notification).toHaveProperty("createdAt")
      done()
    })

    // Wait to ensure the server processes the authentication
    setTimeout(() => {
      // Simulate sending a notification
      io.to(clientSocket.id).emit("new_notification", {
        id: 1,
        senderId,
        senderUsername,
        message,
        createdAt: new Date(),
      })
    }, 100)
  })
})
