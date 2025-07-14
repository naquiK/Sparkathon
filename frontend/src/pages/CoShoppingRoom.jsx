"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useWeather } from "../contexts/WeatherContext"
import { useCart } from "../contexts/CartContext"
import io from "socket.io-client"
import toast from "react-hot-toast"
import { Users, MessageCircle, Send, ShoppingCart, Search, Grid, List, Star, Share2, Copy, X, Eye, ArrowLeft, LogOut } from 'lucide-react'

const CoShoppingRoom = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { getWeatherTheme } = useWeather()
  const { addToCart } = useCart()
  const themeClasses = getWeatherTheme()

  // Socket and room state
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [roomData, setRoomData] = useState(null)
  const [participants, setParticipants] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  // Products state
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState("createdAt")
  const [viewMode, setViewMode] = useState("grid")

  // UI state
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)

  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login")
      return
    }

    const newSocket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
        userId: user._id,
        userName: user.name,
      },
    })

    newSocket.on("connect", () => {
      console.log("Connected to server")
      setIsConnected(true)
      newSocket.emit("join-co-shopping-room", { roomId, userId: user._id, userName: user.name })
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    })

    newSocket.on("room-joined", (data) => {
      console.log("Room joined:", data)
      setRoomData(data.room)
      setParticipants(data.participants)
      setMessages(data.messages || [])
    })

    newSocket.on("participant-joined", (data) => {
      setParticipants(data.participants)
      toast.success(`${data.participant.name} joined the room`)
    })

    newSocket.on("participant-left", (data) => {
      setParticipants(data.participants)
      toast(`${data.participant.name} left the room`)
    })

    newSocket.on("message", (message) => {
      console.log("Received new message:", message); // Debugging log
      setMessages((prev) => [...prev, message])
    })

    newSocket.on("product-shared", (data) => {
      toast.success(`${data.sharedBy.name} shared a product: ${data.product.name}`)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: { name: data.sharedBy.name },
          content: `Shared product: ${data.product.name}`,
          type: "product-share",
          product: data.product,
          timestamp: new Date(),
        },
      ])
    })

    newSocket.on("error", (error) => {
      console.error("Socket error:", error)
      toast.error(error.message || "Connection error")
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, user, roomId, navigate])

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products
  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory, priceRange, sortBy])

  // Auto-scroll chat
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch("http://localhost:5000/api/products")
      const data = await response.json()

      if (data.success) {
        // Handle both response formats
        const productList = data.products || data.data?.products || []
        setProducts(productList)
        setFilteredProducts(productList)
      } else {
        toast.error(data.message || "Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoadingProducts(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter((product) => product.price >= Number(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter((product) => product.price <= Number(priceRange.max))
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    setFilteredProducts(filtered)
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return

    const messageData = {
      roomId,
      content: newMessage.trim(),
      userId: user._id,
      userName: user.name,
    }

    socket.emit("send-message", messageData)
    setNewMessage("")
  }

  const shareProduct = (product) => {
    if (!socket) return

    socket.emit("share-product", {
      roomId,
      product,
      sharedBy: user.name,
      userId: user._id,
    })

    toast.success("Product shared with the room!")
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/co-shopping/${roomId}`
    navigator.clipboard.writeText(roomLink)
    toast.success("Room link copied to clipboard!")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getImageUrl = (product) => {
    if (product?.primaryImg?.url) {
      return product.primaryImg.url
    }
    if (product?.images?.[0]?.url) {
      return product.images[0].url
    }
    return "/placeholder.svg?height=300&width=300"
  }

  const getCategories = () => {
    const categories = [...new Set(products.map((product) => product.category))]
    return categories.filter(Boolean)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to join the co-shopping room.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text}`}>
      {/* Header */}
      <div className={`${themeClasses.card} shadow-sm border-b ${themeClasses.border}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/co-shopping")}
                className={`p-2 rounded-lg ${themeClasses.secondary} hover:opacity-80`}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Co-Shopping Room</h1>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {isConnected ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Connecting...
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users size={20} />
                <span>{participants.length}</span>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className={`${themeClasses.button} px-4 py-2 rounded-lg text-white flex items-center space-x-2`}
              >
                <Share2 size={16} />
                <span>Share Room</span>
              </button>
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit("leave-room", { roomId, userId: user._id })
                  }
                  navigate("/co-shopping")
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Leave</span>
              </button>
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit("terminate-room", { roomId, userId: user._id })
                  }
                  navigate("/co-shopping")
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2"
              >
                <X size={16} />
                <span>Terminate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className={`${themeClasses.card} p-4 rounded-lg shadow-sm mb-6`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${themeClasses.border} ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-4 py-2 border ${themeClasses.border} ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">All Categories</option>
                  {getCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-2 border ${themeClasses.border} ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="createdAt">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? themeClasses.primary + " text-white" : themeClasses.secondary}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? themeClasses.primary + " text-white" : themeClasses.secondary}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className={`${themeClasses.card} h-64 rounded-lg mb-3`}></div>
                    <div className={`h-4 ${themeClasses.card} rounded mb-2`}></div>
                    <div className={`h-4 ${themeClasses.card} rounded w-3/4`}></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={`${themeClasses.card} p-8 rounded-lg text-center`}>
                <p className={`${themeClasses.textSecondary} text-lg`}>No products found matching your criteria.</p>
              </div>
            ) : (
              <div
                className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className={`${themeClasses.card} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(product) || "/placeholder.svg"}
                        alt={product.name}
                        className={`w-full ${viewMode === "grid" ? "h-48" : "h-32"} object-cover cursor-pointer`}
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowProductModal(true)
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                      <button
                        onClick={() => shareProduct(product)}
                        className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <Share2 size={16} className="text-blue-600" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className={`font-semibold text-lg mb-2 ${themeClasses.text} line-clamp-2`}>{product.name}</h3>
                      <p className={`${themeClasses.textSecondary} text-sm mb-3 line-clamp-2`}>{product.description}</p>

                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < Math.floor(product.averageRating || 0) ? "fill-current" : ""}
                            />
                          ))}
                        </div>
                        <span className={`text-xs ${themeClasses.textSecondary} ml-2`}>
                          ({product.numReviews || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        {product.salePrice && product.salePrice < product.price ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">
                              ₹{product.salePrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${themeClasses.secondary}`}>
                          {product.category}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex-1 ${themeClasses.button} text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2`}
                        >
                          <ShoppingCart size={16} />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowProductModal(true)
                          }}
                          className={`px-3 py-2 border ${themeClasses.border} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700`}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <div className={`${themeClasses.card} rounded-lg shadow-sm h-[600px] flex flex-col`}>
              {/* Chat Header */}
              <div className={`p-4 border-b ${themeClasses.border}`}>
                <h3 className="font-semibold flex items-center space-x-2">
                  <MessageCircle size={18} />
                  <span>Room Chat</span>
                </h3>
                <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                  {participants.length} participant{participants.length !== 1 ? "s" : ""} online
                </p>
              </div>

              {/* Participants */}
              <div className={`p-3 border-b ${themeClasses.border}`}>
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${themeClasses.secondary}`}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{participant.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={chatContainerRef}>
                {messages.map((message) => (
                  <div key={message.id || message._id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${themeClasses.accent}`}>
                        {message.user?.name || message.sender?.name || "Unknown"}
                      </span>
                      <span className={`text-xs ${themeClasses.textSecondary}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {message.type === "product-share" || message.messageType === "product" ? (
                      <div className={`p-2 rounded-lg ${themeClasses.secondary} border-l-4 border-blue-500`}>
                        <p className="text-sm font-medium">Shared a product:</p>
                        <p className="text-sm text-blue-600">{message.product?.name || message.productId?.name}</p>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={`p-4 border-t ${themeClasses.border}`}>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className={`flex-1 px-3 py-2 border ${themeClasses.border} ${themeClasses.input} rounded-lg text-sm focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`${themeClasses.button} text-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Room Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeClasses.card} p-6 rounded-lg shadow-lg max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Room</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <p className={`${themeClasses.textSecondary} mb-4`}>
              Share this link with friends to invite them to your co-shopping room:
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/co-shopping/${roomId}`}
                readOnly
                className={`flex-1 px-3 py-2 border ${themeClasses.border} ${themeClasses.input} rounded-lg text-sm`}
              />
              <button
                onClick={copyRoomLink}
                className={`${themeClasses.button} text-white px-4 py-2 rounded-lg flex items-center space-x-2`}
              >
                <Copy size={16} />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.card} rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                <button onClick={() => setShowProductModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={getImageUrl(selectedProduct) || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=300&width=300"
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className={`${themeClasses.textSecondary} mb-2`}>{selectedProduct.description}</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(selectedProduct.averageRating || 0) ? "fill-current" : ""}
                          />
                        ))}
                      </div>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>
                        ({selectedProduct.numReviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.price ? (
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{selectedProduct.salePrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{selectedProduct.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold">₹{selectedProduct.price.toLocaleString()}</span>
                    )}
                    <p className={`text-sm ${themeClasses.textSecondary}`}>Category: {selectedProduct.category}</p>
                    {selectedProduct.brand && (
                      <p className={`text-sm ${themeClasses.textSecondary}`}>Brand: {selectedProduct.brand}</p>
                    )}
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      Stock: {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : "Out of stock"}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      disabled={selectedProduct.stock === 0}
                      className={`flex-1 ${themeClasses.button} text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => shareProduct(selectedProduct)}
                      className={`px-4 py-3 border ${themeClasses.border} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2`}
                    >
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoShoppingRoom
