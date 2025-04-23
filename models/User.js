import pool from "../config/db.js"

// Register a new user
export const registerUser = async (username, password) => {
  const query = "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id"
  const values = [username, password]
  const result = await pool.query(query, values)
  return result.rows[0]
}

// Find user by username
export const findUserByUsername = async (username) => {
  const query = "SELECT * FROM users WHERE username = $1"
  const values = [username]
  const result = await pool.query(query, values)
  return result.rows[0]
}

// Find user by ID
export const findUserById = async (id) => {
  const query = "SELECT * FROM users WHERE id = $1"
  const values = [id]
  const result = await pool.query(query, values)
  return result.rows[0]
}

// Get all users
export const getAllUsers = async () => {
  const query = "SELECT id, username, created_at FROM users"
  const result = await pool.query(query)
  return result.rows
}
