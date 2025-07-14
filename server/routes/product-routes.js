const express = require("express")
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getRecommendations,
  visualSearch,
} = require("../controllers/product-controller")
const authMiddleware = require("../middleware/auth-middleware")
const upload = require("../middleware/multer-middleware")

const router = express.Router()

// Public routes
router.get("/products", getAllProducts)
router.get("/products/:id", getProduct)
router.get("/recommendations", getRecommendations)
router.post("/visual-search", visualSearch)

// Protected routes
router.post("/products/:id/review", authMiddleware, addReview)

// Admin routes (you might want to add admin middleware)
router.post(
  "/products",
  authMiddleware,
  upload.fields([
    { name: "primaryImg", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProduct,
)

router.put(
  "/products/:id",
  authMiddleware,
  upload.fields([
    { name: "primaryImg", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateProduct,
)

router.delete("/products/:id", authMiddleware, deleteProduct)

module.exports = router
