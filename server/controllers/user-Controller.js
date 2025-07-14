const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const cloudinary = require("cloudinary").v2
const { uploadImage } = require("../config/cloudinary")
const mailSender = require("../utils/mailSender")

// Utility function to generate a random token
const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString("hex")
}

// Generate JWT Token
const generateJwtToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role || (user.isAdmin ? "admin" : "user"),
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  )
}

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields",
      })
    }

    let user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationToken = generateVerificationToken()

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    })

    const verificationUrl = `${req.protocol}://${req.get("host")}/verify-email?token=${verificationToken}`

    await mailSender(
      user.email,
      "Email Verification",
      `Please verify your email by clicking on this link: ${verificationUrl}`,
    )

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for verification.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Register user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    })
  }
}

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query

    const user = await User.findOne({ verificationToken: token })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      })
    }

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    })
  } catch (error) {
    console.error("Verify email error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
      error: error.message,
    })
  }
}

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields",
      })
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const token = generateJwtToken(user)

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phoneNo,
        isAdmin: user.isAdmin,
        profilePic: user.profilePic,
        addresses: user.addresses,
      },
    })
  } catch (error) {
    console.error("Login user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to login user",
      error: error.message,
    })
  }
}

// Verify Token
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phoneNo,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        role: user.role,
        addresses: user.addresses || [],
        profilePic: user.profilePic,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
    })
  }
}

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    })
  }
}

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    user.name = name || user.name
    user.email = email || user.email
    user.phoneNo = phone || user.phoneNo

    await user.save()

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phoneNo,
        isAdmin: user.isAdmin,
        profilePic: user.profilePic,
        addresses: user.addresses,
      },
    })
  } catch (error) {
    console.error("Update user profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    })
  }
}

// Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided.",
      })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      })
    }

    // Upload new image to Cloudinary
    const result = await uploadImage(req.file.buffer, "profile_pictures")

    // Update user's profilePic field
    user.profilePic = {
      url: result.secure_url,
      publicId: result.public_id,
    }
    await user.save()

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully.",
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.error("Upload profile picture error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture.",
      error: error.message,
    })
  }
}

// Add new address
const addAddress = async (req, res) => {
  try {
    const { street, city, state, zip, country, isDefault } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // If new address is set as default, unset previous default
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    user.addresses.push({ street, city, state, zip, country, isDefault })
    await user.save()

    res.status(201).json({ success: true, message: "Address added successfully", addresses: user.addresses })
  } catch (error) {
    console.error("Add address error:", error)
    res.status(500).json({ success: false, message: "Failed to add address", error: error.message })
  }
}

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const { street, city, state, zip, country, isDefault } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" })
    }

    // If updated address is set as default, unset previous default
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      street: street || user.addresses[addressIndex].street,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      zip: zip || user.addresses[addressIndex].zip,
      country: country || user.addresses[addressIndex].country,
      isDefault: isDefault, // Explicitly set isDefault
    }
    await user.save()

    res.status(200).json({ success: true, message: "Address updated successfully", addresses: user.addresses })
  } catch (error) {
    console.error("Update address error:", error)
    res.status(500).json({ success: false, message: "Failed to update address", error: error.message })
  }
}

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const initialLength = user.addresses.length
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId)

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ success: false, message: "Address not found" })
    }

    await user.save()

    res.status(200).json({ success: true, message: "Address deleted successfully", addresses: user.addresses })
  } catch (error) {
    console.error("Delete address error:", error)
    res.status(500).json({ success: false, message: "Failed to delete address", error: error.message })
  }
}

// Set Default Address
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const userId = req.user.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    // Make all addresses non-default
    user.addresses.forEach((addr) => (addr.isDefault = false))

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true

    await user.save()

    res.status(200).json({
      success: true,
      message: "Default address set successfully",
      data: user.addresses,
    })
  } catch (error) {
    console.error("Set default address error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to set default address",
      error: error.message,
    })
  }
}

// Get All Users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    })
  }
}

// Delete User (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByIdAndDelete(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    })
  }
}

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  verifyToken,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  deleteUser,
}
