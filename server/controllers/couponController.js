const Coupon = require("../models/couponModel")

// Create a new coupon
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      applicableProducts,
      applicableCategories,
    } = req.body

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      })
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      applicableProducts,
      applicableCategories,
      createdBy: req.user._id,
    })

    await coupon.save()

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating coupon",
      error: error.message,
    })
  }
}

// Get all coupons
const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query

    let query = {}

    // Filter by status
    if (status) {
      query.isActive = status === "active"
    }

    // Search by code or description
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const coupons = await Coupon.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Coupon.countDocuments(query)

    res.status(200).json({
      success: true,
      data: coupons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCoupons: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coupons",
      error: error.message,
    })
  }
}

// Get coupon by ID
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate("createdBy", "name email")

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    res.status(200).json({
      success: true,
      data: coupon,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coupon",
      error: error.message,
    })
  }
}

// Update coupon
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    // Check if code is being changed and if new code already exists
    if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: req.body.code.toUpperCase(),
        _id: { $ne: req.params.id }
      })
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        })
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: req.body.code?.toUpperCase() },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email")

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating coupon",
      error: error.message,
    })
  }
}

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    await Coupon.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting coupon",
      error: error.message,
    })
  }
}

// Apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount, products } = req.body
    const userId = req.user._id

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    })

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      })
    }

    // Check if coupon is valid
    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired or is not yet valid",
      })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded",
      })
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`,
      })
    }

    // Check if user has already used this coupon
    if (coupon.usedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon",
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount)
      }
    } else {
      discountAmount = coupon.discountValue
    }

    // Update coupon usage
    coupon.usedCount += 1
    coupon.usedBy.push(userId)
    await coupon.save()

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        discountAmount,
        finalAmount: orderAmount - discountAmount,
        couponCode: coupon.code,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error applying coupon",
      error: error.message,
    })
  }
}

// Validate coupon
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body
    const userId = req.user._id

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    })

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      })
    }

    // Check if coupon is valid
    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired or is not yet valid",
      })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded",
      })
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`,
      })
    }

    // Check if user has already used this coupon
    if (coupon.usedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon",
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount)
      }
    } else {
      discountAmount = coupon.discountValue
    }

    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      data: {
        discountAmount,
        finalAmount: orderAmount - discountAmount,
        couponCode: coupon.code,
        description: coupon.description,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating coupon",
      error: error.message,
    })
  }
}

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  validateCoupon,
}
