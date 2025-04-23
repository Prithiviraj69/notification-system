import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { registerUser, findUserByUsername, getAllUsers as fetchAllUsers } from "../models/User.js"

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Save user to database
    const result = await registerUser(username, hashedPassword)

    res.status(201).json({
      message: "User registered successfully",
      userId: result.id,
    })
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL unique violation error code
      return res.status(409).json({ error: "Username already exists" })
    }
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    // Find user by username
    const user = await findUserByUsername(username)
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "24h" })

    res.status(200).json({ token })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await fetchAllUsers()
    res.status(200).json(users)
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Render login page
export const renderLogin = (req, res) => {
  res.render("login", { title: "Login" })
}

// Render register page
export const renderRegister = (req, res) => {
  res.render("register", { title: "Register" })
}
