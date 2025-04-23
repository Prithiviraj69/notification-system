/**
 * @jest-environment node
 * @jest-environment-options {"skipExport": true}
 */

import request from "supertest"
import { app } from "../../app.js"
import jwt from "jsonwebtoken"

// Create a test user and return the user data
export const createTestUser = async (username = "testuser", password = "password123") => {
  const response = await request(app).post("/users/register").send({
    username,
    password,
  })
  return response.body
}

// Login a test user and return the JWT token
export const loginTestUser = async (username = "testuser", password = "password123") => {
  const response = await request(app).post("/users/login").send({
    username,
    password,
  })
  return response.body.token
}

// Generate a JWT token for testing
export const generateTestToken = (userId, username) => {
  return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: "24h" })
}

// Create a test notification and return the notification data
export const createTestNotification = async (token, senderId, receiverId, message = "Test notification") => {
  const response = await request(app).post("/notifications/send").set("Authorization", `Bearer ${token}`).send({
    senderId,
    receiverId,
    message,
  })
  return response.body
}
