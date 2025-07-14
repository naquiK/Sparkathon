"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useWeather } from "../contexts/WeatherContext"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Plus,
  Clock,
  UserPlus,
  Sparkles,
  Zap,
  Star,
  Crown,
  MessageCircle,
  Key,
  Lock,
  Copy,
  Check,
} from "lucide-react"

const CoShopping = () => {
  const { user, token } = useAuth()
  const { getThemeClasses } = useWeather()
  const navigate = useNavigate()
  const themeClasses = getThemeClasses()

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [roomCredentials, setRoomCredentials] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [newSession, setNewSession] = useState({
    name: "",
    description: "",
    maxParticipants: 10,
    requirePassword: false,
  })
  const [joinData, setJoinData] = useState({
    roomId: "",
    password: "",
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/co-shopping/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${BACKEND_URL}/api/co-shopping/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSession),
      })
      const data = await response.json()
      if (data.success) {
        setSessions([data.session, ...sessions])
        setShowCreateModal(false)
        setNewSession({ name: "", description: "", maxParticipants: 10, requirePassword: false })

        // Show credentials modal
        setRoomCredentials(data.credentials)
        setShowCredentialsModal(true)

        // Navigate to the room after showing credentials
        setTimeout(() => {
          navigate(`/co-shopping/${data.session.id}`)
        }, 3000)
      }
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  const joinSession = async (sessionId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/co-shopping/sessions/${sessionId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        navigate(`/co-shopping/${sessionId}`)
      }
    } catch (error) {
      console.error("Error joining session:", error)
    }
  }

  const joinByRoomId = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${BACKEND_URL}/api/co-shopping/join-by-room-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(joinData),
      })
      const data = await response.json()
      if (data.success) {
        setShowJoinModal(false)
        setJoinData({ roomId: "", password: "" })
        navigate(`/co-shopping/${data.session.id}`)
      } else {
        alert(data.message || "Failed to join room")
      }
    } catch (error) {
      console.error("Error joining by room ID:", error)
      alert("Failed to join room")
    }
  }

  const viewSession = (sessionId) => {
    navigate(`/co-shopping/${sessionId}`)
  }

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen ${themeClasses.background} ${themeClasses.text} flex items-center justify-center transition-all duration-500`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-bold">Loading amazing sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Users className="w-12 h-12 text-blue-500 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Co-Shopping Rooms
            </span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto font-medium leading-relaxed">
            🛍️ Shop together with friends and family in real-time collaborative rooms! ✨
          </p>
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-6 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span>Real-time Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-500" />
                <span>Share Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-500" />
                <span>Media Sharing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-full font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-xl animate-pulse hover:animate-none"
          >
            <Plus className="w-6 h-6 group-hover:animate-spin" />
            Create New Room
            <Sparkles className="w-6 h-6 group-hover:animate-bounce" />
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-xl"
          >
            <Key className="w-6 h-6 group-hover:animate-bounce" />
            Join by Room ID
          </button>
        </div>

        {/* Enhanced Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border} transition-all duration-500 hover:scale-105 hover:shadow-xl hover:-translate-y-2 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3
                  className={`text-lg font-black ${themeClasses.text} group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500`}
                >
                  {session.name}
                </h3>
                <div className="flex items-center gap-2">
                  {session.requirePassword && <Lock className="w-4 h-4 text-yellow-500" />}
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className={themeClasses.accent}>
                      {session.participants.length}/{session.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>

              <p className={`${themeClasses.textSecondary} mb-4 line-clamp-3 text-sm font-medium leading-relaxed`}>
                {session.description || "Join this amazing co-shopping room!"}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className={themeClasses.textSecondary}>Host:</span>
                  <span className={themeClasses.accent}>{session.host.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Key className="w-4 h-4 text-purple-500" />
                  <span className={themeClasses.textSecondary}>Room ID:</span>
                  <span className={`${themeClasses.accent} font-mono`}>{session.roomId}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className={`text-sm font-semibold ${themeClasses.textSecondary}`}>
                  Created {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Enhanced Participants */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm font-bold ${themeClasses.text}`}>Participants</span>
                </div>
                <div className="flex -space-x-2">
                  {session.participants.slice(0, 4).map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`w-8 h-8 rounded-full ${
                        participant.isHost
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 ring-2 ring-yellow-400"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      } flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-md transform hover:scale-110 transition-all duration-300`}
                      title={`${participant.name}${participant.isHost ? " (Host)" : ""}`}
                    >
                      {participant.isHost && <Crown className="w-3 h-3" />}
                      {!participant.isHost && participant.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {session.participants.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                      +{session.participants.length - 4}
                    </div>
                  )}
                  {session.participants.length === 0 && (
                    <div className={`text-sm ${themeClasses.textSecondary} font-medium`}>🎯 Be the first to join!</div>
                  )}
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="flex gap-2">
                {session.participants.some((p) => p.id === user?.id) ? (
                  <button
                    onClick={() => viewSession(session.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enter Room
                  </button>
                ) : (
                  <button
                    onClick={() => joinSession(session.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join Room
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🛍️</div>
            <h3 className={`text-3xl font-black mb-4 ${themeClasses.text}`}>No Active Rooms</h3>
            <p className={`text-lg ${themeClasses.textSecondary} mb-8 font-medium`}>
              Be the first to create an amazing co-shopping room! 🚀
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <Plus className="w-6 h-6" />
              Create First Room
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border} shadow-xl transform transition-all duration-500 scale-100`}
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <Sparkles className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
              <h2 className={`text-2xl font-black mb-3 ${themeClasses.text}`}>Create Co-Shopping Room</h2>
              <p className={`text-sm ${themeClasses.textSecondary} font-medium`}>
                🎯 Set up your collaborative shopping experience
              </p>
            </div>

            <form onSubmit={createSession} className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${themeClasses.text}`}>🏷️ Room Name</label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium`}
                  placeholder="Enter an exciting room name..."
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${themeClasses.text}`}>📝 Description (Optional)</label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium`}
                  placeholder="Describe what you're shopping for..."
                  rows="3"
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${themeClasses.text}`}>👥 Max Participants</label>
                <input
                  type="number"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession({ ...newSession, maxParticipants: Number.parseInt(e.target.value) })}
                  className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium`}
                  min="2"
                  max="20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newSession.requirePassword}
                  onChange={(e) => setNewSession({ ...newSession, requirePassword: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className={`text-sm font-bold ${themeClasses.text}`}>🔒 Require password to join</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 px-6 py-3 border ${themeClasses.border} ${themeClasses.text} ${themeClasses.cardBackground} rounded-lg font-bold text-sm ${themeClasses.hover} transition-all duration-300 transform hover:scale-105`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-sm transition-all duration-500 transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Room
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join by Room ID Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border} shadow-xl`}
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <Key className="w-10 h-10 text-green-500 animate-bounce" />
              </div>
              <h2 className={`text-2xl font-black mb-3 ${themeClasses.text}`}>Join Room</h2>
              <p className={`text-sm ${themeClasses.textSecondary} font-medium`}>
                🔑 Enter Room ID to join an existing room
              </p>
            </div>

            <form onSubmit={joinByRoomId} className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${themeClasses.text}`}>🏷️ Room ID</label>
                <input
                  type="text"
                  value={joinData.roomId}
                  onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value.toUpperCase() })}
                  className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium font-mono`}
                  placeholder="Enter Room ID (e.g., ABC123)"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${themeClasses.text}`}>🔒 Password (if required)</label>
                <input
                  type="password"
                  value={joinData.password}
                  onChange={(e) => setJoinData({ ...joinData, password: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium`}
                  placeholder="Enter password if room is protected"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className={`flex-1 px-6 py-3 border ${themeClasses.border} ${themeClasses.text} rounded-lg font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-sm transition-all duration-500 transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Credentials Modal */}
      {showCredentialsModal && roomCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border} shadow-xl`}
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <Crown className="w-10 h-10 text-yellow-500 animate-pulse" />
              </div>
              <h2 className={`text-2xl font-black mb-3 ${themeClasses.text}`}>Room Created! 🎉</h2>
              <p className={`text-sm ${themeClasses.textSecondary} font-medium`}>
                Share these credentials with your friends
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${themeClasses.text}`}>🏷️ Room ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomCredentials.roomId}
                    readOnly
                    className={`flex-1 px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} font-mono text-lg font-bold text-center`}
                  />
                  <button
                    onClick={() => copyToClipboard(roomCredentials.roomId, "roomId")}
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copiedField === "roomId" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {roomCredentials.password && (
                <div>
                  <label className={`block text-sm font-bold mb-2 ${themeClasses.text}`}>🔒 Password</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={roomCredentials.password}
                      readOnly
                      className={`flex-1 px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} font-mono text-lg font-bold text-center`}
                    />
                    <button
                      onClick={() => copyToClipboard(roomCredentials.password, "password")}
                      className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {copiedField === "password" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className={`text-sm ${themeClasses.text} font-medium text-center`}>
                💡 Save these credentials! You'll need them to rejoin the room later.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-sm transition-all duration-500 transform hover:scale-105 shadow-md"
              >
                Got it! Enter Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoShopping 
