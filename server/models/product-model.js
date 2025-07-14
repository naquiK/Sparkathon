const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Product description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function (value) {
          return !value || value < this.price
        },
        message: "Sale price must be less than regular price",
      },
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for checking if product is in stock
productSchema.virtual("inStock").get(function () {
  return this.stock > 0
})

// Virtual for checking if stock is low
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0
})

// Virtual for getting effective price (sale price if on sale, otherwise regular price)
productSchema.virtual("effectivePrice").get(function () {
  return this.isOnSale && this.salePrice ? this.salePrice : this.price
})

// Virtual for calculating discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.isOnSale && this.salePrice) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100)
  }
  return 0
})

// Index for better search performance
productSchema.index({ name: "text", description: "text", category: "text", brand: "text" })
productSchema.index({ category: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ price: 1 })
productSchema.index({ averageRating: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ isFeatured: 1 })
productSchema.index({ isOnSale: 1 })

// Pre-save middleware to generate SKU if not provided
productSchema.pre("save", function (next) {
  if (!this.sku) {
    const timestamp = Date.now().toString().slice(-6)
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    this.sku = `${this.category.substring(0, 3).toUpperCase()}-${timestamp}-${randomNum}`
  }
  next()
})

// Pre-save middleware to update average rating
productSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0)
    this.averageRating = totalRating / this.reviews.length
    this.numReviews = this.reviews.length
  } else {
    this.averageRating = 0
    this.numReviews = 0
  }
  next()
})

// Static method to get products by category
productSchema.statics.getByCategory = function (category, options = {}) {
  const { limit = 10, sort = { createdAt: -1 } } = options
  return this.find({ category, isActive: true }).limit(limit).sort(sort)
}

// Static method to get featured products
productSchema.statics.getFeatured = function (limit = 8) {
  return this.find({ isFeatured: true, isActive: true }).limit(limit).sort({ createdAt: -1 })
}

// Static method to get products on sale
productSchema.statics.getOnSale = function (limit = 12) {
  return this.find({ isOnSale: true, isActive: true }).limit(limit).sort({ createdAt: -1 })
}

// Static method to search products
productSchema.statics.searchProducts = function (query, options = {}) {
  const { limit = 20, sort = { score: { $meta: "textScore" } } } = options
  return this.find({ $text: { $search: query }, isActive: true }, { score: { $meta: "textScore" } })
    .limit(limit)
    .sort(sort)
}

// Instance method to check if product can be ordered
productSchema.methods.canOrder = function (quantity = 1) {
  return this.isActive && this.stock >= quantity
}

// Instance method to reduce stock
productSchema.methods.reduceStock = function (quantity) {
  if (this.stock >= quantity) {
    this.stock -= quantity
    return this.save()
  } else {
    throw new Error("Insufficient stock")
  }
}

// Instance method to add stock
productSchema.methods.addStock = function (quantity) {
  this.stock += quantity
  return this.save()
}

const Product = mongoose.model("Product", productSchema)

module.exports = Product
