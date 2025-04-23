// Initialize connectedUsers as a global variable
global.connectedUsers = {}

let ioInstance = null

/**
 * Set up Socket.IO for real-time notifications
 * @param {Server} io - Socket.IO server instance
 */
export const setupSocketIO = (io) => {
  ioInstance = io
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id)

    // Authenticate user
    socket.on("authenticate", (userId) => {
      console.log(`User ${userId} authenticated with socket ${socket.id}`)
      global.connectedUsers[userId] = socket.id
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)

      // Remove user from connected users
      for (const [userId, socketId] of Object.entries(global.connectedUsers)) {
        if (socketId === socket.id) {
          delete global.connectedUsers[userId]
          console.log(`User ${userId} disconnected`)
          break
        }
      }
    })
  })

  return io
}

/**
 * Get the Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
export const getSocketInstance = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized. Ensure setupSocketIO is called.")
  }
  return ioInstance
}
