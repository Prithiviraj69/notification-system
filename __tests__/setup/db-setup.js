/**
 * @jest-environment node
 * @jest-environment-options {"skipExport": true}
 */

import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import pkg from "pg"
const { Pool } = pkg

// Load test environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, "../../.env.test") })

// Create a new PostgreSQL connection pool for tests
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

// Setup test database
export const setupTestDb = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        message VARCHAR(255) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Test database tables initialized")
  } catch (error) {
    console.error("Error initializing test database tables:", error)
  }
}

// Clean up test database
export const cleanupTestDb = async () => {
  try {
    await pool.query("DELETE FROM notifications")
    await pool.query("DELETE FROM users")
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1")
    await pool.query("ALTER SEQUENCE notifications_id_seq RESTART WITH 1")
    console.log("Test database cleaned up")
  } catch (error) {
    console.error("Error cleaning up test database:", error)
  }
}

// Close database connection
export const closeDbConnection = async () => {
  try {
    await pool.end()
    console.log("Database connection closed")
  } catch (error) {
    console.error("Error closing database connection:", error)
  }
}

export default pool
