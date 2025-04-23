import jwt from "jsonwebtoken"

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "24h" })
}

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}
