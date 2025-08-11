"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import { useWeather } from "../contexts/WeatherContext"
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Crown,
  MessageCircle,
  Home,
  Package,
  Gift,
  Users,
  ChevronDown,
  Palette,
} from "lucide-react"

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { cartItems } = useCart()
  const { weather, changeTheme, getThemeClasses, currentTheme } = useWeather()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const themeClasses = getThemeClasses()
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsProfileOpen(false)
    setIsMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const handleThemeChange = (themeName) => {
    changeTheme(themeName)
    setIsThemeOpen(false)
  }

  const themes = [
    { name: "light", label: "Light", icon: <Sun className="w-4 h-4" />, color: "text-yellow-500" },
    { name: "dark", label: "Dark", icon: <Moon className="w-4 h-4" />, color: "text-blue-500" },
    { name: "sunny", label: "Sunny", icon: <Sun className="w-4 h-4" />, color: "text-orange-500" },
    { name: "cloudy", label: "Cloudy", icon: <Cloud className="w-4 h-4" />, color: "text-gray-500" },
    { name: "rainy", label: "Rainy", icon: <CloudRain className="w-4 h-4" />, color: "text-blue-600" },
    { name: "snowy", label: "Snowy", icon: <CloudSnow className="w-4 h-4" />, color: "text-blue-200" },
  ]

  const getCurrentThemeIcon = () => {
    const theme = themes.find((t) => t.name === currentTheme)
    return theme ? <span className={theme.color}>{theme.icon}</span> : <Palette className="w-4 h-4" />
  }

  const navLinks = [
    { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { to: "/products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { to: "/surprise-box", label: "Surprise Box", icon: <Gift className="w-4 h-4" /> },
    { to: "/co-shopping", label: "Co-Shopping", icon: <Users className="w-4 h-4" /> },
    { to: "/chat-rooms", label: "Chat", icon: <MessageCircle className="w-4 h-4" /> },
  ]

  const isAdmin = user?.role === "admin"

  return (
    <nav
      className={`sticky top-0 z-50 ${themeClasses.card} border-b ${themeClasses.border} backdrop-blur-lg bg-opacity-95 shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xl font-black ${themeClasses.text} group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}
              >
                Brother idher
              </span>
              <span
                className={`text-xs ${themeClasses.textSecondary} -mt-1 group-hover:text-blue-500 transition-colors`}
              >
                Shop Together
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, categories..."
                  className={`w-full pl-12 pr-20 py-3 rounded-xl border-2 ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover:shadow-md backdrop-blur-sm`}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  location.pathname === link.to
                    ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 shadow-md"
                    : `${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800/50`
                }`}
              >
                {link.icon}
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Weather Display */}
            {weather && (
              <div
                className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-xl ${themeClasses.secondary} text-sm backdrop-blur-sm`}
              >
                {getCurrentThemeIcon()}
                <span className={themeClasses.textSecondary}>{Math.round(weather.temp)}°C</span>
              </div>
            )}

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className={`p-2.5 rounded-xl ${themeClasses.secondary} hover:${themeClasses.cardBackground} transition-all duration-300 hover:scale-105 hover:shadow-md`}
                title="Change Theme"
              >
                {getCurrentThemeIcon()}
              </button>

              {isThemeOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 ${themeClasses.card} border ${themeClasses.border} rounded-xl shadow-xl py-2 z-50 backdrop-blur-lg`}
                >
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className={`text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wide`}>
                      Choose Theme
                    </p>
                  </div>
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => handleThemeChange(theme.name)}
                      className={`w-full text-left px-4 py-3 text-sm ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors ${
                        currentTheme === theme.name
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      <span className={theme.color}>{theme.icon}</span>
                      <span className="font-medium">{theme.label}</span>
                      {currentTheme === theme.name && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-xl ${themeClasses.secondary} hover:${themeClasses.cardBackground} transition-all duration-300 hover:scale-105 hover:shadow-md group`}
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center space-x-3 p-2 rounded-xl ${themeClasses.secondary} hover:${themeClasses.cardBackground} transition-all duration-300 hover:scale-105 hover:shadow-md group`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-lg">
                      {user?.profilePic?.url ? (
                        <img
                          src={user.profilePic.url || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=32&width=32"
                          }}
                        />
                      ) : isAdmin ? (
                        <Crown className="w-4 h-4 text-yellow-300" />
                      ) : (
                        <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className={`font-semibold ${themeClasses.text} text-sm`}>{user?.name}</span>
                    {isAdmin && (
                      <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold">
                        Admin
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 ${themeClasses.textSecondary} group-hover:rotate-180 transition-transform duration-300`}
                  />
                </button>

                {isProfileOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-64 ${themeClasses.card} border ${themeClasses.border} rounded-xl shadow-xl py-2 z-50 backdrop-blur-lg`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                          {user?.profilePic?.url ? (
                            <img
                              src={user.profilePic.url || "/placeholder.svg"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg?height=40&width=40"
                              }}
                            />
                          ) : isAdmin ? (
                            <Crown className="w-5 h-5 text-yellow-300" />
                          ) : (
                            <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold ${themeClasses.text}`}>{user?.name}</p>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>{user?.email}</p>
                          {isAdmin && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:text-yellow-300 mt-1">
                              <Crown className="w-3 h-3 mr-1" />
                              Administrator
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className={`flex items-center px-4 py-3 text-sm ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                        >
                          <Crown className="w-4 h-4 mr-3 text-yellow-500" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 font-medium ${themeClasses.text} hover:${themeClasses.accent} transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-xl ${themeClasses.secondary} hover:${themeClasses.cardBackground} transition-all duration-300 hover:scale-105`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 backdrop-blur-lg">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    location.pathname === link.to
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400"
                      : `${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800`
                  }`}
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <div className="space-y-1 mb-4">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Profile</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                  >
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block mx-4 mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl text-center transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Theme Selector */}
            <div className={`border-t ${themeClasses.border} pt-4`}>
              <p className={`${themeClasses.textSecondary} text-sm mb-3 px-4 font-semibold uppercase tracking-wide`}>
                Choose Theme
              </p>
              <div className="grid grid-cols-2 gap-2 px-4">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      handleThemeChange(theme.name)
                      setIsMenuOpen(false)
                    }}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-all duration-300 ${
                      currentTheme === theme.name
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 shadow-md"
                        : `${themeClasses.secondary} hover:${themeClasses.cardBackground}`
                    }`}
                  >
                    <span className={theme.color}>{theme.icon}</span>
                    <span className="text-sm font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(isProfileOpen || isThemeOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileOpen(false)
            setIsThemeOpen(false)
          }}
        />
      )}
    </nav>
  )
}

export default Navbar
