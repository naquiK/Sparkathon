"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useWeather } from "../contexts/WeatherContext"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import {
  ShoppingBag,
  Users,
  Gift,
  MessageCircle,
  Star,
  Shield,
  Zap,
  Heart,
  ArrowRight,
  Play,
  MapPin,
  Search,
} from "lucide-react"
import toast from "react-hot-toast"

const Home = () => {
  const { getThemeClasses, weather, thisLocation, setPlace, loading } = useWeather()
  const { isAuthenticated } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [cityInput, setCityInput] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalProducts: 5000,
    happyCustomers: 950,
    citiesServed: 25,
  })

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const themeClasses = getThemeClasses()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products?limit=6&featured=true`)
      if (response.data.success) {
        setFeaturedProducts(response.data.data.products || [])
      }
    } catch (error) {
      console.error("Error fetching featured products:", error)
    }
  }

  const handleCityChange = (e) => {
    e.preventDefault()
    if (cityInput.trim()) {
      setPlace(cityInput.trim())
      setCityInput("")
      toast.success(`Weather updated for ${cityInput}`)
    }
  }

  const getImageUrl = (product) => {
    if (product?.primaryImg?.url) {
      return product.primaryImg.url
    }
    if (product?.images && product.images.length > 0) {
      if (product.images[0]?.url) {
        return product.images[0].url
      }
    }
    return "/placeholder.svg?height=300&width=300"
  }

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Co-Shopping",
      description: "Shop together with friends and family in real-time",
      color: "from-blue-500 to-cyan-500",
      link: "/co-shopping",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Live Chat",
      description: "Connect with other shoppers and share experiences",
      color: "from-green-500 to-emerald-500",
      link: "/chat-rooms",
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Surprise Box",
      description: "Get curated mystery boxes tailored to your preferences",
      color: "from-purple-500 to-pink-500",
      link: "/surprise-box",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Shopping",
      description: "Your data and payments are always protected",
      color: "from-orange-500 to-red-500",
      link: "/products",
    },
  ]

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className={`text-5xl lg:text-6xl font-black ${themeClasses.text} leading-tight`}>
                  Shop
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Together
                  </span>
                  <br />
                  Like Never Before
                </h1>
                <p className={`text-xl ${themeClasses.textSecondary} max-w-lg`}>
                  Experience the future of online shopping with real-time collaboration, AI assistance, and personalized
                  recommendations.
                </p>
              </div>

              {/* Weather & Location */}
              {weather && thisLocation && (
                <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full ${themeClasses.secondary}`}>
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${themeClasses.textSecondary}`}>
                    {Math.round(weather.temp)}°C in {thisLocation}
                  </span>
                </div>
              )}

              {/* City Input */}
              <form onSubmit={handleCityChange} className="flex space-x-3 max-w-md">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter your city for weather-based themes"
                  className={`flex-1 px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "..." : <Search className="w-4 h-4" />}
                </button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={isAuthenticated ? "/products" : "/register"}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                >
                  <ShoppingBag className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  {isAuthenticated ? "Start Shopping" : "Get Started Free"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/co-shopping"
                  className={`inline-flex items-center justify-center px-8 py-4 border-2 ${themeClasses.border} ${themeClasses.text} hover:${themeClasses.cardBackground} font-bold rounded-xl transition-all duration-300 hover:shadow-lg group`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Try Co-Shopping
                </Link>
              </div>
            </div>

            {/* Hero Image/Stats */}
            <div className="relative">
              <div className={`${themeClasses.card} rounded-2xl p-8 shadow-2xl border ${themeClasses.border}`}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-600">{stats.totalUsers.toLocaleString()}+</div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-600">{stats.totalProducts.toLocaleString()}+</div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-600">{stats.happyCustomers}+</div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-orange-600">{stats.citiesServed}+</div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>Cities Served</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-black ${themeClasses.text} mb-4`}>Why Choose eKart?</h2>
            <p className={`text-xl ${themeClasses.textSecondary} max-w-3xl mx-auto`}>
              We're revolutionizing online shopping with innovative features that bring people together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className={`group ${themeClasses.card} p-8 rounded-2xl border ${themeClasses.border} hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold ${themeClasses.text} mb-3`}>{feature.title}</h3>
                <p className={`${themeClasses.textSecondary} mb-4`}>{feature.description}</p>
                <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className={`text-4xl font-black ${themeClasses.text} mb-4`}>Featured Products</h2>
                <p className={`text-xl ${themeClasses.textSecondary}`}>Discover our most popular items</p>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
              >
                View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className={`group ${themeClasses.card} rounded-2xl overflow-hidden border ${themeClasses.border} hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getImageUrl(product) || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=300&width=300"
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className={`font-bold ${themeClasses.text} mb-2 group-hover:text-blue-600 transition-colors`}>
                      {product.name}
                    </h3>
                    <p className={`${themeClasses.textSecondary} text-sm mb-3 line-clamp-2`}>{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-black ${themeClasses.text}`}>
                          ₹{product.discountPrice || product.price}
                        </span>
                        {product.discountPrice && <span className="text-gray-500 line-through">₹{product.price}</span>}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className={`text-sm ${themeClasses.textSecondary}`}>4.5</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`${themeClasses.card} rounded-3xl p-12 border ${themeClasses.border} shadow-2xl`}>
            <h2 className={`text-4xl font-black ${themeClasses.text} mb-6`}>
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className={`text-xl ${themeClasses.textSecondary} mb-8 max-w-2xl mx-auto`}>
              Join thousands of users who are already enjoying collaborative shopping, AI assistance, and personalized
              recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isAuthenticated ? "/co-shopping" : "/register"}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 group"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isAuthenticated ? "Start Co-Shopping" : "Join Now - It's Free"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products"
                className={`inline-flex items-center justify-center px-8 py-4 border-2 ${themeClasses.border} ${themeClasses.text} hover:${themeClasses.cardBackground} font-bold rounded-xl transition-all duration-300 hover:shadow-lg`}
              >
                <Heart className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
