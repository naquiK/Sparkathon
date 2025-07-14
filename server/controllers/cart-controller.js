const Cart = require("../models/cart-model")
const Product = require("../models/product-model")

// Get user cart
const getCart = async (req, res) => {
  try {
    const userId = req.userInfo.id

    let cart = await Cart.findOne({ userId }).populate("items.productId")

    if (!cart) {
      cart = await Cart.create({ userId, items: [] })
    }

    res.status(200).json({
      success: true,
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.userInfo.id
    const { productId, quantity = 1, size, color } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    let cart = await Cart.findOne({ userId })

    if (!cart) {
      cart = await Cart.create({ userId, items: [] })
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color,
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ productId, quantity, size, color })
    }

    // Calculate total
    await cart.populate("items.productId")
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity
    }, 0)

    await cart.save()

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const userId = req.userInfo.id
    const { itemId } = req.params
    const { quantity } = req.body

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    const item = cart.items.id(itemId)
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      })
    }

    if (quantity <= 0) {
      cart.items.pull(itemId)
    } else {
      item.quantity = quantity
    }

    // Recalculate total
    await cart.populate("items.productId")
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity
    }, 0)

    await cart.save()

    res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userInfo.id
    const { itemId } = req.params

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.items.pull(itemId)

    // Recalculate total
    await cart.populate("items.productId")
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity
    }, 0)

    await cart.save()

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.userInfo.id

    await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 })

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}
