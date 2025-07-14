const express = require("express")
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cart-controller")
const authMiddleware = require("../middleware/auth-middleware")

const router = express.Router()

router.use(authMiddleware) // All cart routes require authentication

router.get("/cart", getCart)
router.post("/cart/add", addToCart)
router.put("/cart/item/:itemId", updateCartItem)
router.delete("/cart/item/:itemId", removeFromCart)
router.delete("/cart/clear", clearCart)

module.exports = router
