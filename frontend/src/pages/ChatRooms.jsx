"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { MessageCircle, Plus, Search, Users } from "lucide-react"
import { useWeather } from "../contexts/WeatherContext"

import toast from "react-hot-toast"
import axios from "axios"
import { AuthContext } from "../contexts/AuthContext"

const ChatRooms = () => {
  const { user, token } = useContext(AuthContext)
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newRoomName, setNewRoomName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    if (token) {
      fetchChatRooms()
    } else {
      setLoading(false)
      setError("Please log in to view chat rooms.")
    }
  }, [token])

  const fetchChatRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setChatRooms(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch chat rooms.")
      toast.error(err.response?.data?.message || "Failed to fetch chat rooms.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!newRoomName.trim()) {
      toast.error("Room name cannot be empty.")
      return
    }
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/rooms`,
        { name: newRoomName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (response.data.success) {
        toast.success("Chat room created!")
        setNewRoomName("")
        fetchChatRooms()
      } else {
        toast.error(response.data.message || "Failed to create chat room.")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create chat room.")
    }
  }

  const filteredRooms = chatRooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) return <div className="text-center py-10">Loading chat rooms...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold ${themeClasses.text} mb-8 text-center`}>Public Chat Rooms</h1>

        {/* Create New Room */}
        <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg mb-8`}>
          <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Create a New Chat Room</h2>
          <form onSubmit={handleCreateRoom} className="flex space-x-3">
            <input
              type="text"
              placeholder="Enter room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className={`flex-1 p-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              required
            />
            <button
              type="submit"
              className={`${themeClasses.button} text-white px-5 py-3 rounded-lg flex items-center`}
            >
              <Plus size={20} className="mr-2" /> Create
            </button>
          </form>
        </div>

        {/* Search Rooms */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search chat rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium`}
            />
          </div>
        </div>

        {/* Chat Rooms List */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-10">
            <p className={`${themeClasses.textSecondary} text-lg`}>No chat rooms found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRooms.map((room) => (
              <Link
                key={room._id}
                to={`/chat-room/${room._id}`}
                className={`${themeClasses.card} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-xl font-semibold ${themeClasses.text}`}>{room.name}</h2>
                  <MessageCircle size={24} className={themeClasses.accent} />
                </div>
                <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>Join this room to chat with other users.</p>
                <div className="flex items-center text-sm ${themeClasses.textSecondary} mt-auto">
                  <Users size={16} className="mr-1" />
                  <span>{room.participantsCount || 0} members</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatRooms
