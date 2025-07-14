const express = require("express")
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  validateCoupon,
} = require("../controllers/couponController")
const { authMiddleware } = require("../middleware/auth-middleware")
const { admin } = require("../middleware/auth-middleware")

const router = express.Router()

// Public routes
router.post("/apply", authMiddleware, applyCoupon)
router.post("/validate", authMiddleware, validateCoupon)

// Admin routes
router.post("/", authMiddleware, admin, createCoupon)
router.get("/", authMiddleware, admin, getAllCoupons)
router.get("/:id", authMiddleware, admin, getCouponById)
router.put("/:id", authMiddleware, admin, updateCoupon)
router.delete("/:id", authMiddleware, admin, deleteCoupon)

module.exports = router
