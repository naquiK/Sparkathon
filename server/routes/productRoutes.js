const express = require("express")
const router = express.Router()
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getUniqueCategories,
  getUniqueBrands,
  addProductReview,
} = require("../controllers/productController")
const { protect, authorizeRoles } = require("../middleware/auth-middleware")
const upload = require("../middleware/multer-middleware")


// Public routes
router.get("/", getAllProducts)
router.get("/featured", getFeaturedProducts)
router.get("/categories", getUniqueCategories)
router.get("/brands", getUniqueBrands)
router.get("/:id", getProductById)
router.get("/category/:category", getProductsByCategory)

// Protected routes (Admin only for create, update, delete)
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.fields([
    { name: "primaryImg", maxCount: 1 },
    { name: "additionalImgs", maxCount: 5 },
  ]),
  createProduct,
)
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.fields([
    { name: "primaryImg", maxCount: 1 },
    { name: "additionalImgs", maxCount: 5 },
  ]),
  updateProduct,
)
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct)

// Product review route (User only)
router.post("/:id/review", protect, addProductReview)

module.exports = router
