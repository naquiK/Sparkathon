const express = require("express")
const router = express.Router()
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  deleteUser,
} = require("../controllers/user-Controller")
const { authMiddleware } = require("../middleware/auth-middleware")


const upload = require("../middleware/multer-middleware")
const { adminMiddleware } = require("../middleware/adminMiddleware")


// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)

// Protected routes
router.get("/profile", authMiddleware, getUserProfile)
router.put("/profile", authMiddleware, updateUserProfile)
router.post("/profile/picture", authMiddleware, upload.single("profilePic"), uploadProfilePicture)

// Address routes
router.post("/addresses", authMiddleware, addAddress)
router.put("/addresses/:addressId", authMiddleware, updateAddress)
router.delete("/addresses/:addressId", authMiddleware, deleteAddress)
router.put("/addresses/:addressId/default", authMiddleware, setDefaultAddress)

// Admin routes
router.get("/all", authMiddleware, adminMiddleware , getAllUsers)
router.delete("/:userId", authMiddleware, adminMiddleware, deleteUser) 

module.exports = router
