const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth-middleware")
const Product = require("../models/product-model")

// In-memory storage for co-shopping sessions (in production, use Redis or database)
const coShoppingSessions = new Map()

// Generate room ID and password
const generateRoomCredentials = () => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
  const password = Math.random().toString(36).substring(2, 10)
  return { roomId, password }
}

// Get all active co-shopping sessions
router.get("/sessions", authMiddleware, (req, res) => {
  try {
    const activeSessions = Array.from(coShoppingSessions.values()).filter((session) => session.isActive)
    res.json({
      success: true,
      sessions: activeSessions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching co-shopping sessions",
      error: error.message,
    })
  }
})

// Create a new co-shopping session
router.post("/sessions", authMiddleware, (req, res) => {
  try {
    const { name, description, maxParticipants = 10, requirePassword = false } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Session name is required",
      })
    }

    const { roomId, password } = generateRoomCredentials()
    const sessionId = `room_${Date.now()}_${roomId}`

    const newSession = {
      id: sessionId,
      roomId: roomId,
      password: requirePassword ? password : null,
      name,
      description: description || "",
      host: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
      participants: [
        {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          joinedAt: new Date(),
          isHost: true,
        },
      ],
      maxParticipants,
      requirePassword,
      isActive: true,
      createdAt: new Date(),
      sharedProducts: [],
      messages: [],
    }

    coShoppingSessions.set(sessionId, newSession)

    res.status(201).json({
      success: true,
      message: "Co-shopping session created successfully",
      session: newSession,
      credentials: {
        roomId: roomId,
        password: requirePassword ? password : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating co-shopping session",
      error: error.message,
    })
  }
})

// Join a co-shopping session
router.post("/sessions/:id/join", authMiddleware, (req, res) => {
  try {
    const sessionId = req.params.id
    const { password } = req.body
    const session = coShoppingSessions.get(sessionId)

    if (!session || !session.isActive) {
      return res.status(404).json({
        success: false,
        message: "Co-shopping session not found or inactive",
      })
    }

    // Check password if required
    if (session.requirePassword && session.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      })
    }

    // Check if user is already in the session
    const isAlreadyParticipant = session.participants.some((p) => p.id === req.user.id)
    if (isAlreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: "You are already in this session",
      })
    }

    // Check if session is full
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Session is full",
      })
    }

    // Add user to session
    session.participants.push({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      joinedAt: new Date(),
      isHost: false,
    })

    coShoppingSessions.set(sessionId, session)

    res.json({
      success: true,
      message: "Successfully joined co-shopping session",
      session,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error joining co-shopping session",
      error: error.message,
    })
  }
})

// Join by room ID
router.post("/join-by-room-id", authMiddleware, (req, res) => {
  try {
    const { roomId, password } = req.body

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      })
    }

    // Find session by room ID
    const session = Array.from(coShoppingSessions.values()).find((s) => s.roomId === roomId.toUpperCase() && s.isActive)

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Room not found or inactive",
      })
    }

    // Check password if required
    if (session.requirePassword && session.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      })
    }

    // Check if user is already in the session
    const isAlreadyParticipant = session.participants.some((p) => p.id === req.user.id)
    if (isAlreadyParticipant) {
      return res.json({
        success: true,
        message: "You are already in this session",
        session,
      })
    }

    // Check if session is full
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Session is full",
      })
    }

    // Add user to session
    session.participants.push({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      joinedAt: new Date(),
      isHost: false,
    })

    coShoppingSessions.set(session.id, session)

    res.json({
      success: true,
      message: "Successfully joined co-shopping session",
      session,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error joining co-shopping session",
      error: error.message,
    })
  }
})

// Leave a co-shopping session
router.post("/sessions/:id/leave", authMiddleware, (req, res) => {
  try {
    const sessionId = req.params.id
    const session = coShoppingSessions.get(sessionId)

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Co-shopping session not found",
      })
    }

    // Remove user from session
    session.participants = session.participants.filter((p) => p.id !== req.user.id)

    // If host leaves or no participants left, deactivate session
    if (session.host.id === req.user.id || session.participants.length === 0) {
      session.isActive = false
    }

    coShoppingSessions.set(sessionId, session)

    res.json({
      success: true,
      message: "Successfully left co-shopping session",
      session,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error leaving co-shopping session",
      error: error.message,
    })
  }
})

// Terminate session (host only)
router.post("/sessions/:id/terminate", authMiddleware, (req, res) => {
  try {
    const sessionId = req.params.id
    const session = coShoppingSessions.get(sessionId)

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Co-shopping session not found",
      })
    }

    // Check if user is the host
    if (session.host.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the host can terminate the session",
      })
    }

    // Deactivate session
    session.isActive = false
    coShoppingSessions.set(sessionId, session)

    res.json({
      success: true,
      message: "Session terminated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error terminating session",
      error: error.message,
    })
  }
})

// Get specific co-shopping session
router.get("/sessions/:id", authMiddleware, (req, res) => {
  try {
    const sessionId = req.params.id
    const session = coShoppingSessions.get(sessionId)

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Co-shopping session not found",
      })
    }

    // Check if user is a participant
    const isParticipant = session.participants.some((p) => p.id === req.user.id)
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this session",
      })
    }

    res.json({
      success: true,
      session,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching co-shopping session",
      error: error.message,
    })
  }
})

// Share product in session
router.post("/sessions/:id/share-product", authMiddleware, (req, res) => {
  try {
    const sessionId = req.params.id
    const { productId } = req.body
    const session = coShoppingSessions.get(sessionId)

    if (!session || !session.isActive) {
      return res.status(404).json({
        success: false,
        message: "Co-shopping session not found or inactive",
      })
    }

    // Check if user is a participant
    const isParticipant = session.participants.some((p) => p.id === req.user.id)
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this session",
      })
    }

    // Add product to shared products
    const sharedProduct = {
      productId,
      sharedBy: {
        id: req.user.id,
        name: req.user.name,
      },
      sharedAt: new Date(),
    }

    session.sharedProducts.push(sharedProduct)
    coShoppingSessions.set(sessionId, session)

    res.json({
      success: true,
      message: "Product shared successfully",
      sharedProduct,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sharing product",
      error: error.message,
    })
  }
})

// Get shared products in session
router.get("/sessions/:id/products", authMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.id
    const session = coShoppingSessions.get(sessionId)

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Co-shopping session not found",
      })
    }

    // Check if user is a participant
    const isParticipant = session.participants.some((p) => p.id === req.user.id)
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this session",
      })
    }

    // Get product details for shared products
    const productIds = session.sharedProducts.map((sp) => sp.productId)
    const products = await Product.find({ _id: { $in: productIds } })

    const sharedProductsWithDetails = session.sharedProducts.map((sp) => {
      const product = products.find((p) => p._id.toString() === sp.productId)
      return {
        ...sp,
        product,
      }
    })

    res.json({
      success: true,
      sharedProducts: sharedProductsWithDetails,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shared products",
      error: error.message,
    })
  }
})

module.exports = router
