import request from "supertest"
import { app } from "../app.js"
import { setupTestDb, cleanupTestDb, closeDbConnection } from "./setup/db-setup.js"
import { createTestUser } from "./helpers/test-helpers.js"

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

describe("Authentication", () => {
  describe("User Registration", () => {
    test("should register a new user successfully", async () => {
      const response = await request(app).post("/users/register").send({
        username: "testuser",
        password: "password123",
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("message", "User registered successfully")
      expect(response.body).toHaveProperty("userId")
    })

    test("should return 400 if username or password is missing", async () => {
      const response = await request(app).post("/users/register").send({
        username: "testuser",
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("error", "Username and password are required")
    })

    test("should return 409 if username already exists", async () => {
      // First registration
      await request(app).post("/users/register").send({
        username: "testuser",
        password: "password123",
      })

      // Second registration with same username
      const response = await request(app).post("/users/register").send({
        username: "testuser",
        password: "password456",
      })

      expect(response.status).toBe(409)
      expect(response.body).toHaveProperty("error", "Username already exists")
    })
  })

  describe("User Login", () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await createTestUser()
    })

    test("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/users/login").send({
        username: "testuser",
        password: "password123",
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("token")
      expect(typeof response.body.token).toBe("string")
    })

    test("should return 400 if username or password is missing", async () => {
      const response = await request(app).post("/users/login").send({
        username: "testuser",
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("error", "Username and password are required")
    })

    test("should return 401 if username does not exist", async () => {
      const response = await request(app).post("/users/login").send({
        username: "nonexistentuser",
        password: "password123",
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error", "Invalid credentials")
    })

    test("should return 401 if password is incorrect", async () => {
      const response = await request(app).post("/users/login").send({
        username: "testuser",
        password: "wrongpassword",
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error", "Invalid credentials")
    })
  })
})
