const Product = require("../models/product-model")
const { uploadImage } = require("../config/cloudinary")
const cloudinary = require("cloudinary").v2

// Get all products with filters
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sustainability,
      page = 1,
      limit = 12,
      sort = "createdAt",
      search,
    } = req.query

    const query = {}

    if (category) query.category = { $regex: category, $options: "i" }
    if (brand) query.brand = { $regex: brand, $options: "i" }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (rating) query.ratings = { $gte: Number(rating) }
    if (sustainability) query.sustainabilityScore = { $gte: Number(sustainability) }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    const products = await Product.find(query)
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.userId", "name profilePic")
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }
    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, brand, size, expire, specification, sustainabilityScore, tags } =
      req.body

    let primaryImg = {}
    const images = []

    if (req.files) {
      if (req.files.primaryImg) {
        const { url, publicId } = await uploadImage(req.files.primaryImg[0].path)
        primaryImg = { url, publicId }
      }

      if (req.files.images) {
        for (const file of req.files.images) {
          const { url, publicId } = await uploadImage(file.path)
          images.push({ url, publicId })
        }
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      brand,
      size,
      expire,
      specification,
      primaryImg,
      images,
      sustainabilityScore: sustainabilityScore || 0,
      tags: tags ? tags.split(",") : [],
    })

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const updates = req.body

    if (req.files) {
      if (req.files.primaryImg) {
        if (product.primaryImg.publicId) {
          await cloudinary.uploader.destroy(product.primaryImg.publicId)
        }
        const { url, publicId } = await uploadImage(req.files.primaryImg[0].path)
        updates.primaryImg = { url, publicId }
      }

      if (req.files.images) {
        // Delete old images
        for (const img of product.images) {
          if (img.publicId) {
            await cloudinary.uploader.destroy(img.publicId)
          }
        }

        updates.images = []
        for (const file of req.files.images) {
          const { url, publicId } = await uploadImage(file.path)
          updates.images.push({ url, publicId })
        }
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true })

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Delete images from cloudinary
    if (product.primaryImg.publicId) {
      await cloudinary.uploader.destroy(product.primaryImg.publicId)
    }

    for (const img of product.images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId)
      }
    }

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Add review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const userId = req.userInfo.id
    const userName = req.userInfo.name

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find((review) => review.userId.toString() === userId)

    if (existingReview) {
      existingReview.rating = rating
      existingReview.comment = comment
    } else {
      product.reviews.push({
        userId,
        userName,
        rating,
        comment,
      })
    }

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0)
    product.ratings = totalRating / product.reviews.length

    await product.save()

    res.status(200).json({
      success: true,
      message: "Review added successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// AI-powered product recommendations
const getRecommendations = async (req, res) => {
  try {
    const { userId, category, mood, occasion, weather } = req.query

    const query = {}

    if (category) query.category = { $regex: category, $options: "i" }

    // Mood-based recommendations
    if (mood === "stressed") {
      query.tags = { $in: ["comfort", "relaxing", "cozy"] }
    } else if (mood === "excited") {
      query.tags = { $in: ["trendy", "bold", "vibrant"] }
    }

    // Weather-based recommendations
    if (weather === "rainy") {
      query.tags = { $in: ["waterproof", "rain-gear"] }
    }

    // Occasion-based recommendations
    if (occasion) {
      query.tags = { $in: [occasion] }
    }

    const recommendations = await Product.find(query).sort({ ratings: -1 }).limit(10)

    res.status(200).json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Visual search - find similar products
const visualSearch = async (req, res) => {
  try {
    // This would integrate with AI vision APIs in production
    const { category, color, style } = req.body

    const query = {}
    if (category) query.category = { $regex: category, $options: "i" }
    if (color) query.tags = { $in: [color] }
    if (style) query.tags = { $in: [style] }

    const similarProducts = await Product.find(query).limit(20)

    res.status(200).json({
      success: true,
      data: similarProducts,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getRecommendations,
  visualSearch,
}
