import pkg from "pg"
const { Pool } = pkg
import dotenv from "dotenv"

dotenv.config()

// Debug environment variables
console.log("Database connection details (sanitized):")
console.log(`- DB_USER: ${process.env.DB_USER ? "✓ Set" : "✗ Not set"}`)
console.log(`- DB_HOST: ${process.env.DB_HOST ? "✓ Set" : "✗ Not set"}`)
console.log(`- DB_NAME: ${process.env.DB_NAME ? "✓ Set" : "✗ Not set"}`)
console.log(`- DB_PASSWORD: ${process.env.DB_PASSWORD ? "✓ Set" : "✗ Not set"}`)
console.log(`- DB_PORT: ${process.env.DB_PORT ? "✓ Set" : "✗ Not set"}`)

// Use explicit values from environment or fallback to hardcoded values for Render
const dbConfig = {
  user: process.env.DB_USER || "notification_system_user",
  host: process.env.DB_HOST || "dpg-d04dsj95pdvs73c9634g-a.oregon-postgres.render.com",
  database: process.env.DB_NAME || "notification_system",
  password: process.env.DB_PASSWORD || "cE6KBplawPp189k4XBTE16Dq2Cgo0j9v",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
}

// Create a new PostgreSQL connection pool with SSL for Render
const pool = new Pool(dbConfig)

// Test the database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err.stack)
  } else {
    console.log("Database connected successfully")
  }
})

// Initialize database tables
const initDb = async () => {
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

    console.log("Database tables initialized")
  } catch (error) {
    console.error("Error initializing database tables:", error)
  }
}

// Initialize the database
initDb()

export default pool
