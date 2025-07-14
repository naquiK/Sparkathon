const express = require("express")
const router = express.Router()
const { getUserPreferences, generateSurpriseBox, orderSurpriseBox } = require("../controllers/surpriseBoxController")
const { authMiddleware } = require("../middleware/auth-middleware")

// Get user preferences based on order history
router.get("/preferences", authMiddleware, getUserPreferences)

// Generate surprise box recommendations
router.post("/generate", authMiddleware, generateSurpriseBox)

// Order surprise box
router.post("/order", authMiddleware, orderSurpriseBox)

module.exports = router
