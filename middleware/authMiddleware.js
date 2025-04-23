import jwt from "jsonwebtoken"

export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error("JWT verification error:", error)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

// Middleware to check if user is authenticated for web pages
export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.redirect("/users/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.clearCookie("token")
    return res.redirect("/users/login")
  }
}
