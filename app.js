import express from "express"
import http from "http"
import { Server } from "socket.io"
import path from "path"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import logger from "morgan"
import { fileURLToPath } from "url"

// Routes
import authRoutes from "./routes/authRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

// Socket service
import { setupSocketIO } from "./services/socketService.js"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const server = http.createServer(app)
const io = new Server(server)

// Set up socket.io
setupSocketIO(io)

// Middleware
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Set up EJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/users", authRoutes)
app.use("/notifications", notificationRoutes)

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Notification System" })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  })
})

// Start server only if this file is run directly (not imported in tests)
if (process.env.NODE_ENV !== "test" || process.env.START_SERVER === "true") {
  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export { app, server, io }
export default app
