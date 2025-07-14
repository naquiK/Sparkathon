const ChatRoom = require("../models/chatModel")
const Product = require("../models/product-model")

// Create chat room
const createChatRoom = async (req, res) => {
  try {
    const { name } = req.body
    const createdBy = req.userInfo?.id || req.user?._id

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      })
    }

    const chatRoom = await ChatRoom.create({
      name,
      createdBy,
      participants: [createdBy],
    })

    await chatRoom.populate("participants", "name profilePic")

    res.status(201).json({
      success: true,
      message: "Chat room created successfully",
      data: chatRoom,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all chat rooms
const getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({ isActive: true })
      .populate("participants", "name profilePic")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: chatRooms,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Join chat room
const joinChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.userInfo?.id || req.user?._id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      })
    }

    const chatRoom = await ChatRoom.findById(roomId)

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      })
    }

    if (!chatRoom.participants.includes(userId)) {
      chatRoom.participants.push(userId)
      await chatRoom.save()
    }

    await chatRoom.populate("participants", "name profilePic")

    res.status(200).json({
      success: true,
      message: "Joined chat room successfully",
      data: chatRoom,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get chat room messages
const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params
    const { page = 1, limit = 50 } = req.query

    const chatRoom = await ChatRoom.findById(roomId)
      .populate("messages.sender", "name profilePic")
      .populate("messages.productId", "name primaryImg price")

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      })
    }

    // Get paginated messages
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + Number.parseInt(limit)
    const messages = chatRoom.messages.slice(startIndex, endIndex)

    res.status(200).json({
      success: true,
      data: {
        messages,
        totalMessages: chatRoom.messages.length,
        hasMore: endIndex < chatRoom.messages.length,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Send message
const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params
    const { content, messageType = "text", productId } = req.body
    const sender = req.userInfo?.id || req.user?._id

    if (!sender) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      })
    }

    const chatRoom = await ChatRoom.findById(roomId)

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      })
    }

    if (!chatRoom.participants.includes(sender)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this chat room",
      })
    }

    const message = {
      sender,
      content,
      messageType,
      productId: messageType === "product" ? productId : undefined,
    }

    chatRoom.messages.push(message)
    await chatRoom.save()

    // Populate the new message
    await chatRoom.populate("messages.sender", "name profilePic")
    if (messageType === "product") {
      await chatRoom.populate("messages.productId", "name primaryImg price")
    }

    const newMessage = chatRoom.messages[chatRoom.messages.length - 1]

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Share product in chat
const shareProduct = async (req, res) => {
  try {
    const { roomId, productId } = req.params
    const sender = req.userInfo?.id || req.user?._id

    if (!sender) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const chatRoom = await ChatRoom.findById(roomId)
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      })
    }

    if (!chatRoom.participants.includes(sender)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this chat room",
      })
    }

    const message = {
      sender,
      content: `Shared a product: ${product.name}`,
      messageType: "product",
      productId,
    }

    chatRoom.messages.push(message)
    await chatRoom.save()

    await chatRoom.populate("messages.sender", "name profilePic")
    await chatRoom.populate("messages.productId", "name primaryImg price")

    const newMessage = chatRoom.messages[chatRoom.messages.length - 1]

    res.status(201).json({
      success: true,
      message: "Product shared successfully",
      data: newMessage,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  createChatRoom,
  getChatRooms,
  joinChatRoom,
  getChatMessages,
  sendMessage,
  shareProduct,
}
