const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth-middleware")
const chatController = require("../controllers/chatController")

// Create a new chat room
router.post("/rooms", authMiddleware, chatController.createChatRoom)

// Get all chat rooms
router.get("/rooms", authMiddleware, chatController.getChatRooms)

// Join a chat room
router.post("/rooms/:roomId/join", authMiddleware, chatController.joinChatRoom)

// Get messages for a specific chat room
router.get("/rooms/:roomId/messages", authMiddleware, chatController.getChatMessages)

// Send a message in a chat room
router.post("/rooms/:roomId/messages", authMiddleware, chatController.sendMessage)

// Share a product in a chat room
router.post("/rooms/:roomId/share-product/:productId", authMiddleware, chatController.shareProduct)

module.exports = router
