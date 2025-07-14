const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "product", "image"],
    default: "text",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  maxParticipants: {
    type: Number,
    default: 50,
  },
}, {
  timestamps: true,
})

// Index for better performance
chatRoomSchema.index({ createdAt: -1 })
chatRoomSchema.index({ participants: 1 })
chatRoomSchema.index({ isActive: 1 })

module.exports = mongoose.model("ChatRoom", chatRoomSchema)
