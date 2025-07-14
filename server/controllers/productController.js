const Product = require("../models/product-model")
const { uploadImage } = require("../config/cloudinary")

// Get all products with filtering, sorting, and pagination
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    // Build filter object
    const filter = {}

    if (category && category !== "all") {
      filter.category = category
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Calculate pagination
    const skip = (page - 1) * limit
    const limitNum = Number(limit)

    // Get products with pagination
    const products = await Product.find(filter).sort(sort).skip(skip).limit(limitNum).lean()

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter)
    const totalPages = Math.ceil(totalProducts / limitNum)

    // Get unique categories for filtering
    const categories = await Product.distinct("category")
    // Get unique brands for filtering
    const brands = await Product.distinct("brand")

    res.status(200).json({
      success: true,
      products: products || [], // Direct products array for co-shopping compatibility
      data: {
        // Nested data for main products page
        products: products || [],
        categories: categories || [],
        brands: brands || [],
        currentPage: Number(page),
        totalPages,
        total: totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
      products: [], // Ensure products array is always returned
      data: {
        products: [],
        categories: [],
        brands: [],
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    })
  }
}

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
      .populate({
        path: "reviews.userId",
        select: "name profilePic.url",
      })
      .lean()

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
    console.error("Get product by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
      data: null,
    })
  }
}

// Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, stock, brand, specifications, tags } = req.body

    // Handle image uploads
    let primaryImg = null
    const additionalImgs = []

    if (req.files) {
      if (req.files.primaryImg) {
        const primaryImgResult = await uploadImage(req.files.primaryImg[0].buffer, "products")
        primaryImg = {
          url: primaryImgResult.secure_url,
          publicId: primaryImgResult.public_id,
        }
      }

      if (req.files.additionalImgs) {
        for (const file of req.files.additionalImgs) {
          const result = await uploadImage(file.buffer, "products")
          additionalImgs.push({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      }
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      category,
      stock: Number(stock),
      brand,
      primaryImg,
      images: additionalImgs, // Use 'images' field as per schema
      specifications: specifications ? JSON.parse(specifications) : {},
      tags: tags ? JSON.parse(tags) : [],
    })

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    })
  } catch (error) {
    console.error("Create product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    })
  }
}

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Handle image uploads if provided
    if (req.files) {
      if (req.files.primaryImg) {
        const primaryImgResult = await uploadImage(req.files.primaryImg[0].buffer, "products")
        updateData.primaryImg = {
          url: primaryImgResult.secure_url,
          publicId: primaryImgResult.public_id,
        }
      }

      if (req.files.additionalImgs) {
        const additionalImgs = []
        for (const file of req.files.additionalImgs) {
          const result = await uploadImage(file.buffer, "products")
          additionalImgs.push({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
        updateData.images = additionalImgs // Use 'images' field as per schema
      }
    }

    // Parse JSON fields if they exist
    if (updateData.specifications && typeof updateData.specifications === "string") {
      updateData.specifications = JSON.parse(updateData.specifications)
    }
    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = JSON.parse(updateData.tags)
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    })
  }
}

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    })
  }
}

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8).sort({ createdAt: -1 }).lean()

    res.status(200).json({
      success: true,
      products: products || [],
    })
  } catch (error) {
    console.error("Get featured products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
      products: [],
    })
  }
}

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const { page = 1, limit = 12 } = req.query

    const skip = (page - 1) * limit
    const products = await Product.find({ category }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean()

    const totalProducts = await Product.countDocuments({ category })

    res.status(200).json({
      success: true,
      products: products || [],
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
    })
  } catch (error) {
    console.error("Get products by category error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products by category",
      error: error.message,
      products: [],
    })
  }
}

// Get unique categories
const getUniqueCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category")
    res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Get unique categories error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    })
  }
}

// Get unique brands
const getUniqueBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand")
    res.status(200).json({
      success: true,
      data: brands,
    })
  } catch (error) {
    console.error("Get unique brands error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
    })
  }
}

// Add a review to a product
const addProductReview = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user.id // From auth middleware

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment are required." })
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." })
    }

    // Check if user has already reviewed this product
    const alreadyReviewed = product.reviews.find((r) => r.userId.toString() === userId.toString())

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product." })
    }

    const review = {
      userId,
      rating: Number(rating),
      comment,
    }

    product.reviews.push(review)
    product.totalReviews = product.reviews.length
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save()

    res.status(201).json({ success: true, message: "Review added successfully." })
  } catch (error) {
    console.error("Add product review error:", error)
    res.status(500).json({ success: false, message: "Failed to add review.", error: error.message })
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getUniqueCategories,
  getUniqueBrands,
  addProductReview,
}
