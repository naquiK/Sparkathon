"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"
import { useWeather } from "../contexts/WeatherContext"
import { ShoppingCart, Star, Truck, ShieldCheck, RefreshCw, MessageCircle, Plus, Minus, Send } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { Loader2, XCircle } from "lucide-react"

const ProductDetail = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { user, isAuthenticated, token } = useAuth()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mainImage, setMainImage] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(`${BACKEND_URL}/api/products/${id}`)
        if (response.data.success) {
          setProduct(response.data.data)
          setMainImage(response.data.data.primaryImg?.url || response.data.data.images[0]?.url || "/placeholder.svg")
        } else {
          setError(response.data.message || "Failed to fetch product details.")
        }
      } catch (err) {
        setError("Failed to connect to the server or product not found.")
        console.error("Error fetching product details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, BACKEND_URL])

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("This product is out of stock.")
      return
    }
    addToCart(product, quantity)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please log in to submit a review.")
      return
    }
    if (reviewRating === 0) {
      toast.error("Please provide a rating.")
      return
    }
    if (!reviewText.trim()) {
      toast.error("Please write a comment for your review.")
      return
    }

    setSubmittingReview(true)
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/products/${id}/reviews`,
        { rating: reviewRating, comment: reviewText },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (response.data.success) {
        toast.success("Review submitted successfully!")
        setReviewText("")
        setReviewRating(0)
        // Optionally refetch product to show new review
        const updatedProductResponse = await axios.get(`${BACKEND_URL}/api/products/${id}`)
        if (updatedProductResponse.data.success) {
          setProduct(updatedProductResponse.data.data)
        }
      } else {
        toast.error(response.data.message || "Failed to submit review.")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred while submitting your review.")
      console.error("Review submission error:", err)
    } finally {
      setSubmittingReview(false)
    }
  }

  const getProductImageUrl = (productObj) => {
    if (productObj?.primaryImg?.url) {
      return productObj.primaryImg.url
    }
    if (productObj?.images && productObj.images.length > 0) {
      return productObj.images[0].url
    }
    return "/placeholder.svg?height=500&width=500"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className={`w-16 h-16 ${themeClasses.accent} animate-spin mx-auto mb-4`} />
          <p className={`${themeClasses.textSecondary} text-lg`}>Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <XCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Error loading product:</p>
          <p className="text-lg">{error}</p>
          <p className="text-sm mt-4">Please try again later or check the product ID.</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className={`w-24 h-24 ${themeClasses.accent} mx-auto mb-6 opacity-50`} />
          <h2 className={`text-2xl font-bold ${themeClasses.accent} mb-4`}>Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/products"
            className={`${themeClasses.button} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
          >
            View All Products
          </Link>
        </div>
      </div>
    )
  }

  const hasReviewed = product.reviews.some((review) => review.userId?._id === user?._id)

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-6 breadcrumbs">
          <ul>
            <li>
              <Link to="/" className={`${themeClasses.textSecondary} hover:${themeClasses.accent}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className={`${themeClasses.textSecondary} hover:${themeClasses.accent}`}>
                Products
              </Link>
            </li>
            <li>
              <span className={`${themeClasses.text}`}>{product.name}</span>
            </li>
          </ul>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Images */}
          <div>
            <div className={`${themeClasses.card} rounded-xl shadow-lg overflow-hidden mb-4`}>
              <img
                src={mainImage || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 object-contain p-4"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=384&width=384"
                }}
              />
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img.url || "/placeholder.svg"}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
                    mainImage === img.url ? "border-blue-500" : `${themeClasses.border}`
                  } hover:border-blue-500 transition-colors`}
                  onClick={() => setMainImage(img.url)}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=80&width=80"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className={`text-4xl font-extrabold ${themeClasses.text} mb-3`}>{product.name}</h1>
            <p className={`text-xl ${themeClasses.textSecondary} mb-4`}>{product.brand}</p>

            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className={i < Math.floor(product.ratings || 0) ? "fill-current" : ""} />
                ))}
              </div>
              <span className={`text-sm ${themeClasses.textSecondary} ml-2`}>
                ({product.numOfReviews || 0} reviews)
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mb-6">
              {product.discountPrice && product.discountPrice < product.price ? (
                <>
                  <span className={`text-4xl font-bold text-green-600`}>₹{product.discountPrice.toLocaleString()}</span>
                  <span className="text-xl text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                </>
              ) : (
                <span className={`text-4xl font-bold ${themeClasses.text}`}>₹{product.price.toLocaleString()}</span>
              )}
            </div>

            <p className={`text-lg ${themeClasses.textSecondary} leading-relaxed mb-6`}>{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className={`font-medium ${themeClasses.text}`}>Quantity:</span>
              <div className="flex items-center border ${themeClasses.border} rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`p-2 ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} rounded-l-md`}
                >
                  <Minus size={18} />
                </button>
                <span className={`px-4 py-2 ${themeClasses.text}`}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={`p-2 ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} rounded-r-md`}
                >
                  <Plus size={18} />
                </button>
              </div>
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                product.stock === 0 ? "bg-gray-400 cursor-not-allowed" : `${themeClasses.button} hover:opacity-90`
              } flex items-center justify-center`}
            >
              <ShoppingCart size={20} className="mr-2" /> Add to Cart
            </button>

            {/* Features/Guarantees */}
            <div className={`mt-8 p-6 ${themeClasses.secondary} rounded-xl border ${themeClasses.border} shadow-sm`}>
              <div className="flex items-center mb-3">
                <Truck size={20} className="text-green-500 mr-3" />
                <p className={`${themeClasses.text}`}>Free Shipping on orders over ₹500</p>
              </div>
              <div className="flex items-center mb-3">
                <RefreshCw size={20} className="text-purple-500 mr-3" />
                <p className={`${themeClasses.text}`}>30 Day Return Policy</p>
              </div>
              <div className="flex items-center">
                <ShieldCheck size={20} className="text-blue-500 mr-3" />
                <p className={`${themeClasses.text}`}>Secure Payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        {Object.keys(product.specifications).length > 0 && (
          <div className={`mt-12 ${themeClasses.card} p-6 rounded-xl shadow-lg`}>
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specification).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b ${themeClasses.border} py-2">
                  <span className={`font-medium ${themeClasses.textSecondary}`}>{key}:</span>
                  <span className={`${themeClasses.text}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className={`mt-12 ${themeClasses.card} p-6 rounded-xl shadow-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6 flex items-center`}>
            <MessageCircle size={24} className="mr-2 ${themeClasses.accent}" /> Customer Reviews ({product.numOfReviews}
            )
          </h2>

          {isAuthenticated && !hasReviewed && (
            <div className="mb-8 p-4 border ${themeClasses.border} rounded-lg ${themeClasses.secondary}">
              <h3 className={`text-xl font-semibold ${themeClasses.text} mb-3`}>Write a Review</h3>
              <div className="flex items-center mb-3">
                <span className={`mr-2 ${themeClasses.textSecondary}`}>Your Rating:</span>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={`cursor-pointer ${
                      i < reviewRating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
                    }`}
                    onClick={() => setReviewRating(i + 1)}
                  />
                ))}
              </div>
              <textarea
                className={`w-full p-3 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                rows="4"
                placeholder="Share your thoughts on this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview || reviewRating === 0 || !reviewText.trim()}
                className={`mt-4 ${themeClasses.button} text-white px-5 py-2 rounded-lg flex items-center`}
              >
                {submittingReview ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} className="mr-2" /> Submit Review
                  </>
                )}
              </button>
            </div>
          )}

          {product.reviews.length === 0 ? (
            <p className={`${themeClasses.textSecondary} text-center py-4`}>No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div
                  key={review._id}
                  className={`p-4 border ${themeClasses.border} rounded-lg ${themeClasses.secondary}`}
                >
                  <div className="flex items-center mb-2">
                    <img
                      src={review.userId?.profilePic?.url || "/placeholder.svg?height=32&width=32"}
                      alt={review.name}
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className={`font-semibold ${themeClasses.text}`}>{review.name}</p>
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < review.rating ? "fill-current" : ""} />
                        ))}
                      </div>
                    </div>
                    <span className={`ml-auto text-xs ${themeClasses.textSecondary}`}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
