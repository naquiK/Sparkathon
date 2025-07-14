"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, Search, Filter, X, Star } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useWeather } from "../contexts/WeatherContext"
import toast from "react-hot-toast"
import axios from "axios"

const Products = () => {
  const { addToCart } = useCart()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sortBy, setSortBy] = useState("createdAt") // 'createdAt', 'price-low', 'price-high', 'rating', 'name'
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy, currentPage, BACKEND_URL])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page: currentPage,
        limit: 12, // Items per page
        search: searchTerm,
        category: selectedCategory,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sortBy: sortBy.split("-")[0], // e.g., 'price' from 'price-low'
        sortOrder: sortBy.includes("-") ? sortBy.split("-")[1] : "desc", // 'low' or 'high'
      }

      const response = await axios.get(`${BACKEND_URL}/api/products`, { params })
      if (response.data.success) {
        setProducts(response.data.data.products)
        setTotalPages(response.data.data.totalPages)
      } else {
        setError(response.data.message || "Failed to fetch products.")
      }
    } catch (err) {
      setError("Failed to connect to the server or fetch products.")
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products/categories`)
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error("This product is out of stock.")
      return
    }
    addToCart(product, 1)
  }

  const getProductImageUrl = (product) => {
    if (product?.primaryImg?.url) {
      return product.primaryImg.url
    }
    if (product?.images && product.images.length > 0) {
      return product.images[0].url
    }
    return "/placeholder.svg?height=300&width=300"
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("createdAt")
    setCurrentPage(1)
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold ${themeClasses.text} mb-8 text-center`}>Our Products</h1>

        {/* Filters and Search */}
        <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative col-span-full lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full pl-10 pr-4 py-3 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div>
              <label htmlFor="category" className="sr-only">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full px-4 py-3 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-1/2 px-4 py-3 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                min="0"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-1/2 px-4 py-3 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                min="0"
              />
            </div>

            <div>
              <label htmlFor="sortBy" className="sr-only">
                Sort By
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full px-4 py-3 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              >
                <option value="createdAt">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="ratings-desc">Rating: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>

            <div className="col-span-full flex justify-end">
              <button
                onClick={handleClearFilters}
                className={`px-6 py-3 rounded-lg ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} transition-colors flex items-center`}
              >
                <Filter size={20} className="mr-2" /> Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className={`${themeClasses.card} h-64 rounded-xl mb-3`}></div>
                <div className={`h-4 ${themeClasses.card} rounded mb-2`}></div>
                <div className={`h-4 ${themeClasses.card} rounded w-3/4`}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            <p>{error}</p>
            <p>Please ensure your backend server is running and accessible.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">
            <p className={`${themeClasses.textSecondary} text-lg`}>No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`${themeClasses.card} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={getProductImageUrl(product) || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=200&width=200"
                      }}
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3
                        className={`font-semibold ${themeClasses.text} mb-2 hover:${themeClasses.accent} transition-colors`}
                      >
                        {product.name}
                      </h3>
                    </Link>
                    <p className={`text-sm ${themeClasses.textSecondary} mb-3 line-clamp-2`}>{product.description}</p>
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(product.ratings || 0) ? "fill-current" : ""}
                          />
                        ))}
                      </div>
                      <span className={`text-xs ${themeClasses.textSecondary} ml-2`}>
                        ({product.numOfReviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.discountPrice && product.discountPrice < product.price ? (
                          <>
                            <span className="text-lg font-bold text-green-600">
                              ₹{product.discountPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className={`text-lg font-bold ${themeClasses.text}`}>
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`${themeClasses.button} text-white p-2 rounded-full hover:opacity-90 transition-opacity`}
                        title="Add to Cart"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-10">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Previous
                </button>
                <span className={`${themeClasses.text}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products
