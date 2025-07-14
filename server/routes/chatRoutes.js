const express = require("express")
const {
  createChatRoom,
  getChatRooms,
  joinChatRoom,
  getChatMessages,
  sendMessage,
  shareProduct,
} = require("../controllers/chatController")
const { authMiddleware } = require("../middleware/auth-middleware")

const router = express.Router()

// All chat routes require authentication
router.use(authMiddleware)

router.post("/rooms", createChatRoom)
router.get("/rooms", getChatRooms)
router.post("/rooms/:roomId/join", joinChatRoom)
router.get("/rooms/:roomId/messages", getChatMessages)
router.post("/rooms/:roomId/messages", sendMessage)
router.post("/rooms/:roomId/share/:productId", shareProduct)

module.exports = router
