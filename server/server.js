const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const connectDB = require("./DB/connectionDB")
const userRoutes = require("./routes/userRoute")
const productRoutes = require("./routes/productRoutes")
const couponRoutes = require("./routes/couponRoutes")
const chatRoutes = require("./routes/chatRoutes")
const surpriseBoxRoutes = require("./routes/surpriseBoxRoutes")
const coShoppingRoutes = require("./routes/coShoppingRoutes")
const User = require("./models/userModel")

const app = express() 
const server = http.createServer(app)
  
// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173" , `${process.env.FRONTEND_URL}`],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: corsOptions,
})

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return next(new Error("User not found"))
    }

    socket.userId = user._id.toString()
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || user.role === "admin",
    }
    next()
  } catch (error) {
    console.error("Socket authentication error:", error)
    next(new Error("Authentication error"))
  }
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", async (roomId) => {
    try {
      socket.join(roomId)

      // Emit to other users in the room that someone joined
      socket.to(roomId).emit("user-joined", {
        user: socket.user,
        participants: await getRoomParticipants(roomId),
        message: `${socket.user.name} joined the room`,
      })

      console.log(`User ${socket.user.name} joined room ${roomId}`)
    } catch (error) {
      console.error("Error joining room:", error)
    }
  })

  socket.on("send-message", async (data) => {
    try {
      const { roomId, content, type, file } = data

      const message = {
        id: Date.now(),
        user: socket.user,
        content,
        type: type || "text",
        file,
        timestamp: new Date(),
      }

      // Broadcast message to all users in the room
      io.to(roomId).emit("message", message)

      console.log(`Message sent in room ${roomId} by ${socket.user.name}`)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  })

  socket.on("share-product", async (data) => {
    try {
      const { roomId, product } = data

      if (!product) {
        console.error("No product data provided for sharing")
        return
      }

      // Broadcast product share to all users in the room
      socket.to(roomId).emit("product-shared", {
        product,
        sharedBy: socket.user,
        timestamp: new Date(),
      })

      console.log(`Product "${product.name}" shared in room ${roomId} by ${socket.user.name}`)
    } catch (error) {
      console.error("Error sharing product:", error)
      socket.emit("error", { message: "Failed to share product" })
    }
  })

  socket.on("leave-room", async (roomId) => {
    try {
      socket.leave(roomId)

      // Emit to other users in the room that someone left
      socket.to(roomId).emit("user-left", {
        user: socket.user,
        participants: await getRoomParticipants(roomId),
        message: `${socket.user.name} left the room`,
      })

      console.log(`User ${socket.user.name} left room ${roomId}`)
    } catch (error) {
      console.error("Error leaving room:", error)
    }
  })

  socket.on("terminate-room", (roomId) => {
    try {
      // Notify all users in the room that it's being terminated
      io.to(roomId).emit("room-terminated")

      console.log(`Room ${roomId} terminated by ${socket.user.name}`)
    } catch (error) {
      console.error("Error terminating room:", error)
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Helper function to get room participants
async function getRoomParticipants(roomId) {
  try {
    const room = io.sockets.adapter.rooms.get(roomId)
    if (!room) return []

    const participants = []
    for (const socketId of room) {
      const socket = io.sockets.sockets.get(socketId)
      if (socket && socket.user) {
        participants.push(socket.user)
      }
    }
    return participants
  } catch (error) {
    console.error("Error getting room participants:", error)
    return []
  }
}

// Database connection
connectDB()

// Routes
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/surprise-box", surpriseBoxRoutes)
app.use("/api/co-shopping", coShoppingRoutes)

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "eKart API is running!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server, io }
