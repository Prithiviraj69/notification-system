import express from "express"
import { register, login, renderLogin, renderRegister, getAllUsers } from "../controllers/authController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

// API routes
router.post("/register", register)
router.post("/login", login)
router.get("/all", authenticateToken, getAllUsers) // New endpoint to get all users

// Web routes
router.get("/login", renderLogin)
router.get("/register", renderRegister)

export default router
