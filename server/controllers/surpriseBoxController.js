const User = require("../models/userModel")
const Product = require("../models/product-model")
const Order = require("../models/orderModel")

// Get user preferences based on order history
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.userInfo.id

    // Get user's order history
    const orders = await Order.find({ user: userId }).populate("orderItems.product")

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasOrderHistory: false,
          message: "No order history found. We'll ask you some questions to understand your preferences.",
        },
      })
    }

    // Analyze order history
    const categoryPreferences = {}
    const brandPreferences = {}
    const priceRanges = []
    let totalSpent = 0

    orders.forEach((order) => {
      totalSpent += order.total
      order.orderItems.forEach((item) => {
        if (item.product) {
          // Category analysis
          const category = item.product.category
          categoryPreferences[category] = (categoryPreferences[category] || 0) + item.quantity

          // Brand analysis
          const brand = item.product.brand
          brandPreferences[brand] = (brandPreferences[brand] || 0) + item.quantity

          // Price analysis
          priceRanges.push(item.price)
        }
      })
    })

    const avgOrderValue = totalSpent / orders.length
    const avgItemPrice = priceRanges.length > 0 ? priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length : 0

    // Get top preferences
    const topCategories = Object.entries(categoryPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category)

    const topBrands = Object.entries(brandPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([brand]) => brand)

    res.status(200).json({
      success: true,
      data: {
        hasOrderHistory: true,
        preferences: {
          topCategories,
          topBrands,
          avgOrderValue: Math.round(avgOrderValue),
          avgItemPrice: Math.round(avgItemPrice),
          totalOrders: orders.length,
          totalSpent: Math.round(totalSpent),
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Generate surprise box recommendations
const generateSurpriseBox = async (req, res) => {
  try {
    const userId = req.userInfo.id
    const { budget, preferences, occasion, giftFor } = req.body

    if (!budget || budget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid budget",
      })
    }

    const query = { isActive: true, stock: { $gt: 0 } }

    // Apply budget filter
    query.price = { $lte: budget }

    // If user has preferences from order history or questionnaire
    if (preferences && preferences.categories && preferences.categories.length > 0) {
      query.category = { $in: preferences.categories }
    }

    if (preferences && preferences.brands && preferences.brands.length > 0) {
      query.brand = { $in: preferences.brands }
    }

    // Occasion-based filtering
    if (occasion) {
      switch (occasion.toLowerCase()) {
        case "birthday":
          query.$or = [
            { category: { $in: ["Electronics", "Fashion", "Books", "Toys"] } },
            { tags: { $in: ["gift", "birthday", "celebration"] } },
          ]
          break
        case "anniversary":
          query.$or = [
            { category: { $in: ["Fashion", "Jewelry", "Home & Garden", "Electronics"] } },
            { tags: { $in: ["romantic", "anniversary", "couple"] } },
          ]
          break
        case "festival":
          query.$or = [
            { category: { $in: ["Fashion", "Electronics", "Home & Garden", "Food"] } },
            { tags: { $in: ["festival", "celebration", "traditional"] } },
          ]
          break
        case "just because":
          // No specific filter, keep it random
          break
      }
    }

    // Gender-based filtering
    if (giftFor) {
      switch (giftFor.toLowerCase()) {
        case "male":
          query.$or = [
            { category: { $in: ["Electronics", "Sports", "Fashion"] } },
            { tags: { $in: ["men", "male", "masculine"] } },
          ]
          break
        case "female":
          query.$or = [
            { category: { $in: ["Fashion", "Beauty", "Jewelry", "Home & Garden"] } },
            { tags: { $in: ["women", "female", "feminine"] } },
          ]
          break
        case "child":
          query.$or = [
            { category: { $in: ["Toys", "Books", "Sports", "Electronics"] } },
            { tags: { $in: ["kids", "children", "educational"] } },
          ]
          break
      }
    }

    // Get products matching criteria
    const products = await Product.find(query).limit(50)

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found matching your criteria. Try increasing your budget or adjusting preferences.",
      })
    }

    // AI-like selection algorithm
    const selectedProducts = []
    let remainingBudget = budget
    const maxItems = Math.min(5, Math.floor(budget / 100)) // Max 5 items or budget/100

    // Sort products by rating and popularity
    const sortedProducts = products.sort((a, b) => {
      const scoreA = (a.ratings || 0) * 0.7 + (a.totalReviews || 0) * 0.3
      const scoreB = (b.ratings || 0) * 0.7 + (b.totalReviews || 0) * 0.3
      return scoreB - scoreA
    })

    // Select products ensuring variety
    const usedCategories = new Set()
    const usedBrands = new Set()

    for (const product of sortedProducts) {
      if (selectedProducts.length >= maxItems) break
      if (product.price > remainingBudget) continue

      // Ensure variety in categories and brands
      const categoryCount = Array.from(usedCategories).filter((cat) => cat === product.category).length
      const brandCount = Array.from(usedBrands).filter((brand) => brand === product.brand).length

      if (categoryCount < 2 && brandCount < 2) {
        selectedProducts.push(product)
        remainingBudget -= product.price
        usedCategories.add(product.category)
        usedBrands.add(product.brand)
      }
    }

    // If we still have budget and fewer than maxItems, add more products
    if (selectedProducts.length < maxItems && remainingBudget > 0) {
      for (const product of sortedProducts) {
        if (selectedProducts.length >= maxItems) break
        if (product.price > remainingBudget) continue
        if (!selectedProducts.find((p) => p._id.toString() === product._id.toString())) {
          selectedProducts.push(product)
          remainingBudget -= product.price
        }
      }
    }

    const totalCost = selectedProducts.reduce((sum, product) => sum + product.price, 0)
    const savings = budget - totalCost

    res.status(200).json({
      success: true,
      data: {
        surpriseBox: {
          products: selectedProducts,
          totalItems: selectedProducts.length,
          totalCost: Math.round(totalCost),
          budget: budget,
          savings: Math.round(savings),
          occasion: occasion || "General",
          giftFor: giftFor || "Anyone",
        },
        message: `We've curated ${selectedProducts.length} amazing products for you within your budget of ₹${budget}!`,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Save surprise box as order
const orderSurpriseBox = async (req, res) => {
  try {
    const userId = req.userInfo.id
    const { products, shippingAddress, paymentMethod } = req.body

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products selected",
      })
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      })
    }

    // Create order items
    const orderItems = []
    let subtotal = 0

    for (const productId of products) {
      const product = await Product.findById(productId)
      if (product && product.stock > 0) {
        orderItems.push({
          product: product._id,
          quantity: 1,
          price: product.price,
          discountPrice: product.discountPrice || 0,
        })
        subtotal += product.discountPrice > 0 ? product.discountPrice : product.price
      }
    }

    const shipping = subtotal > 499 ? 0 : 50
    const tax = Math.round(subtotal * 0.18) // 18% GST
    const total = subtotal + shipping + tax

    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      subtotal,
      tax,
      shipping,
      total,
      orderStatus: "pending",
      paymentStatus: "pending",
    })

    await order.save()

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    res.status(201).json({
      success: true,
      message: "Surprise box ordered successfully!",
      data: {
        orderId: order._id,
        total: order.total,
        estimatedDelivery: "3-5 business days",
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  getUserPreferences,
  generateSurpriseBox,
  orderSurpriseBox,
}
