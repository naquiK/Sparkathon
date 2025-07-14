"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import { useAuth } from "../contexts/AuthContext"
import { useWeather } from "../contexts/WeatherContext"
import { Send, ArrowLeft, Users, X, ShoppingCart, Share2, Copy } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { Search } from "lucide-react" // Declare the Search variable

const ChatRoom = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useAuth()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [socket, setSocket] = useState(null)
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const messagesEndRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login")
      return
    }

    const newSocket = io(BACKEND_URL, {
      query: { token },
    })
    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to server")
      newSocket.emit("joinRoom", roomId)
    })

    newSocket.on("roomData", (data) => {
      setRoom(data.room)
      setParticipants(data.participants)
      setMessages(data.room.messages || [])
      setLoading(false)
    })

    newSocket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })

    newSocket.on("productShared", (data) => {
      toast.success(`${data.sender.name} shared a product: ${data.productId.name}`)
      setMessages((prevMessages) => [...prevMessages, { ...data, type: "product-share" }])
    })

    newSocket.on("participantJoined", (data) => {
      setParticipants(data.participants)
      toast.success(`${data.participant.name} joined the chat.`)
    })

    newSocket.on("participantLeft", (data) => {
      setParticipants(data.participants)
      toast(`${data.participant.name} left the chat.`)
    })

    newSocket.on("error", (err) => {
      console.error("Socket error:", err)
      setError(err.message)
      toast.error(err.message)
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    return () => {
      newSocket.disconnect()
    }
  }, [roomId, isAuthenticated, user, token, navigate, BACKEND_URL])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && socket) {
      socket.emit("sendMessage", { roomId, message: newMessage })
      setNewMessage("")
    }
  }

  const handleSearchProducts = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSearchResults(response.data.data.products) // Access data.data.products
    } catch (err) {
      toast.error("Failed to search products.")
      console.error("Product search error:", err)
    }
  }

  const handleShareProduct = (product) => {
    if (socket) {
      socket.emit("shareProduct", { roomId, productId: product._id })
      toast.success(`${product.name} shared in chat!`)
      setShowProductSearch(false)
      setSearchTerm("")
      setSearchResults([])
    }
  }

  const getProductImageUrl = (product) => {
    if (product?.primaryImg?.url) {
      return product.primaryImg.url
    }
    if (product?.images && product.images.length > 0) {
      return product.images[0].url
    }
    return "/placeholder.svg?height=50&width=50"
  }

  const handleAddToCart = (product) => {
    // Implement add to cart logic here
    toast.success(`Added ${product.name} to your cart! (Not fully implemented yet)`)
  }

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/chat-room/${roomId}`
    navigator.clipboard.writeText(roomLink)
    toast.success("Room link copied to clipboard!")
  }

  if (loading) return <div className="text-center py-10">Loading chat room...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>
  if (!room) return <div className="text-center py-10">Chat room not found.</div>

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${themeClasses.card} rounded-xl shadow-lg flex flex-col h-[80vh]`}>
          {/* Chat Header */}
          <div className={`p-4 border-b ${themeClasses.border} flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/chat-rooms")}
                className={`p-2 rounded-full ${themeClasses.secondary} hover:${themeClasses.cardBackground}`}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>{room.name}</h2>
                <p className={`text-sm ${themeClasses.textSecondary} flex items-center`}>
                  <Users size={16} className="mr-1" /> {participants.length} members online
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className={`${themeClasses.button} px-3 py-2 rounded-lg text-white flex items-center space-x-2 text-sm`}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender._id === user._id ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                    msg.sender._id === user._id
                      ? "bg-blue-500 text-white rounded-br-none"
                      : `${themeClasses.secondary} ${themeClasses.text} rounded-bl-none`
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <img
                      src={msg.sender.profilePic?.url || "/placeholder.svg?height=24&width=24"}
                      alt={msg.sender.name}
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                    />
                    <span className="font-semibold text-sm">
                      {msg.sender._id === user._id ? "You" : msg.sender.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {msg.type === "product-share" && msg.productId ? (
                    <div className={`${themeClasses.cardBackground} p-3 rounded-md mt-2 border ${themeClasses.border}`}>
                      <p className={`text-sm font-medium ${themeClasses.text} mb-2`}>Product Shared:</p>
                      <div className="flex items-center space-x-3">
                        <img
                          src={getProductImageUrl(msg.productId) || "/placeholder.svg"}
                          alt={msg.productId.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <a
                            href={`/products/${msg.productId._id}`}
                            className={`font-semibold ${themeClasses.accent} hover:underline`}
                          >
                            {msg.productId.name}
                          </a>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>
                            ₹{(msg.productId.discountPrice || msg.productId.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleAddToCart(msg.productId)}
                          className={`${themeClasses.button} text-white px-3 py-1 rounded-md text-sm flex items-center`}
                        >
                          <ShoppingCart size={16} className="mr-1" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className={`p-4 border-t ${themeClasses.border}`}>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowProductSearch(!showProductSearch)}
                className={`p-2 rounded-lg ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground}`}
                title="Share a Product"
              >
                <ShoppingCart size={20} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className={`flex-1 p-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
              <button
                onClick={handleSendMessage}
                className={`${themeClasses.button} text-white px-5 py-3 rounded-lg flex items-center`}
                disabled={!newMessage.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Search Modal */}
        {showProductSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${themeClasses.card} rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Share a Product</h2>
                <button onClick={() => setShowProductSearch(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSearchProducts} className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                />
                <button type="submit" className={`${themeClasses.button} text-white px-4 py-2 rounded-lg`}>
                  <Search size={18} />
                </button>
              </form>
              <div className="space-y-3">
                {searchResults.length === 0 ? (
                  <p className={`${themeClasses.textSecondary} text-center`}>No products found.</p>
                ) : (
                  searchResults.map((product) => (
                    <div
                      key={product._id}
                      className={`flex items-center p-3 rounded-lg border ${themeClasses.border} ${themeClasses.secondary} hover:${themeClasses.cardBackground} cursor-pointer`}
                      onClick={() => handleShareProduct(product)}
                    >
                      <img
                        src={getProductImageUrl(product) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div className="flex-1">
                        <h3 className={`font-semibold ${themeClasses.text}`}>{product.name}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          ₹{(product.discountPrice || product.price).toLocaleString()}
                        </p>
                      </div>
                      <Share2 size={20} className={themeClasses.accent} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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
                Share this link with friends to invite them to this chat room:
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={`${window.location.origin}/chat-room/${roomId}`}
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
      </div>
    </div>
  )
}

export default ChatRoom
