const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    min: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
  applicableCategories: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
})

// Indexes for better performance
couponSchema.index({ code: 1 })
couponSchema.index({ validFrom: 1, validUntil: 1 })
couponSchema.index({ isActive: 1 })

// Validation
couponSchema.pre("save", function(next) {
  if (this.validFrom >= this.validUntil) {
    next(new Error("Valid from date must be before valid until date"))
  }
  if (this.discountType === "percentage" && this.discountValue > 100) {
    next(new Error("Percentage discount cannot be more than 100%"))
  }
  next()
})

module.exports = mongoose.model("Coupon", couponSchema)
