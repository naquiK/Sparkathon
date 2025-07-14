const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/userModel")

// Basic auth middleware with userInfo
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Decrypt email and phone if they exist
    if (decoded.email && decoded.phoneNo) {
      const algorithm = "aes-256-cbc"
      const key = Buffer.from(process.env.AES_KEY, "hex")
      const iv = Buffer.from(process.env.AES_IV, "hex")

      try {
        const decipherEmail = crypto.createDecipheriv(algorithm, key, iv)
        let decryptedEmail = decipherEmail.update(decoded.email, "hex", "utf-8")
        decryptedEmail += decipherEmail.final("utf-8")

        const decipherPhone = crypto.createDecipheriv(algorithm, key, iv)
        let decryptedPhone = decipherPhone.update(decoded.phoneNo, "hex", "utf-8")
        decryptedPhone += decipherPhone.final("utf-8")

        req.userInfo = {
          id: decoded.id,
          name: decoded.name,
          email: decryptedEmail,
          phoneNo: decryptedPhone,
          role: decoded.role,
        }
      } catch (decryptError) {
        // If decryption fails, use the original values
        req.userInfo = {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          phoneNo: decoded.phoneNo,
          role: decoded.role,
        }
      }
    } else {
      req.userInfo = decoded
    }

    // Also set req.user for compatibility
    req.user = await User.findById(decoded.id || decoded.userId).select("-password")

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    })
  }
}

// Protect middleware that fetches user from database
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    })
  }
}

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    })
  }
}

// Authorize roles middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      })
    }

    next()
  }
}

// Alternative auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      })
    }
    req.user = user
    next()
  })
}

// Verify token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is not valid",
    })
  }
}

module.exports = {
  authMiddleware,
  protect,
  admin,
  authorizeRoles,
  authenticateToken,
  verifyToken,
}
