const mongoose = require("mongoose")

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: String,
  color: String,
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedWith: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      permissions: {
        type: String,
        enum: ["view", "edit"],
        default: "view",
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Cart", cartSchema)
