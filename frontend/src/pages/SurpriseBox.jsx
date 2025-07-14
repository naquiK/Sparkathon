"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import { Gift, Sparkles, Heart, Star, ShoppingBag, Zap } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const SurpriseBox = () => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userPreferences, setUserPreferences] = useState(null)
  const [surpriseBox, setSurpriseBox] = useState(null)
  const [formData, setFormData] = useState({
    budget: "",
    occasion: "",
    giftFor: "",
    categories: [],
    brands: [],
    personalityType: "",
    interests: [],
  })

  const occasions = [
    { value: "birthday", label: "Birthday", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💕" },
    { value: "festival", label: "Festival", icon: "🎉" },
    { value: "graduation", label: "Graduation", icon: "🎓" },
    { value: "promotion", label: "Promotion", icon: "🏆" },
    { value: "just because", label: "Just Because", icon: "💝" },
  ]

  const giftForOptions = [
    { value: "myself", label: "Myself", icon: "😊" },
    { value: "male", label: "Male Friend/Family", icon: "👨" },
    { value: "female", label: "Female Friend/Family", icon: "👩" },
    { value: "child", label: "Child", icon: "👶" },
    { value: "couple", label: "Couple", icon: "💑" },
  ]

  const personalityTypes = [
    { value: "adventurous", label: "Adventurous", desc: "Loves trying new things" },
    { value: "practical", label: "Practical", desc: "Prefers useful items" },
    { value: "creative", label: "Creative", desc: "Enjoys artistic things" },
    { value: "tech-savvy", label: "Tech Savvy", desc: "Loves gadgets and technology" },
    { value: "homebody", label: "Homebody", desc: "Enjoys comfort and home items" },
  ]

  const interestOptions = [
    "Technology",
    "Fashion",
    "Books",
    "Sports",
    "Music",
    "Art",
    "Cooking",
    "Travel",
    "Gaming",
    "Fitness",
    "Photography",
    "Gardening",
  ]

  useEffect(() => {
    fetchUserPreferences()
  }, [])

  const fetchUserPreferences = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/surprise-box/preferences")
      if (response.data.success) {
        setUserPreferences(response.data.data)
        if (response.data.data?.hasOrderHistory) {
          setStep(2) // Skip questionnaire if user has order history
        }
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
      // Don't show error toast here as it's not critical
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }))
  }

  const generateSurpriseBox = async () => {
    if (!formData.budget || formData.budget <= 0) {
      toast.error("Please enter a valid budget")
      return
    }

    if (!formData.giftFor) {
      toast.error("Please select who this gift is for")
      return
    }

    setLoading(true)
    try {
      const preferences = {
        categories: formData.categories,
        brands: formData.brands,
        personalityType: formData.personalityType,
        interests: formData.interests,
      }

      // If user has order history, merge with their historical preferences
      if (userPreferences?.hasOrderHistory) {
        preferences.categories = [
          ...new Set([...preferences.categories, ...(userPreferences.preferences.topCategories || [])]),
        ]
        preferences.brands = [...new Set([...preferences.brands, ...(userPreferences.preferences.topBrands || [])])]
      }

      const response = await axios.post("http://localhost:5000/api/surprise-box/generate", {
        budget: Number.parseFloat(formData.budget),
        preferences,
        occasion: formData.occasion,
        giftFor: formData.giftFor,
      })

      if (response.data.success) {
        setSurpriseBox(response.data.data.surpriseBox)
        setStep(3)
        toast.success(response.data.message || "Surprise box generated successfully!")
      } else {
        throw new Error(response.data.message || "Failed to generate surprise box")
      }
    } catch (error) {
      console.error("Error generating surprise box:", error)
      toast.error(error.response?.data?.message || error.message || "Failed to generate surprise box")
    } finally {
      setLoading(false)
    }
  }

  const addAllToCart = () => {
    if (surpriseBox?.products) {
      surpriseBox.products.forEach((product) => {
        addToCart(product, 1)
      })
      toast.success(`Added ${surpriseBox.products.length} items to cart!`)
    }
  }

  const regenerateSurpriseBox = () => {
    setSurpriseBox(null)
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI Surprise Box</h1>
            <Sparkles className="h-8 w-8 text-yellow-500 ml-3 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Let our AI curate the perfect surprise box just for you! Based on your preferences and budget, we'll select
            amazing products you'll love.
          </p>
        </div>

        {/* Step 1: Welcome & User History */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome, {user?.name}!</h2>
                {userPreferences?.hasOrderHistory ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 mb-4">
                      Great! We found your order history. Here's what we know about your preferences:
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Favorite Categories:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {userPreferences.preferences.topCategories.map((cat, index) => (
                            <li key={index}>{cat}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Favorite Brands:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {userPreferences.preferences.topBrands.map((brand, index) => (
                            <li key={index}>{brand}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Average Order Value:</strong>
                        <p>₹{userPreferences.preferences.avgOrderValue}</p>
                      </div>
                      <div>
                        <strong>Total Orders:</strong>
                        <p>{userPreferences.preferences.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200">
                      No worries! We'll ask you a few questions to understand your preferences and create the perfect
                      surprise box for you.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <Zap className="h-5 w-5 mr-2" />
                Let's Create Your Surprise Box!
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences Form */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Tell Us About Your Preferences
              </h2>

              <div className="space-y-8">
                {/* Budget */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    What's your budget? *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount in ₹"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    What's the occasion?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {occasions.map((occasion) => (
                      <button
                        key={occasion.value}
                        onClick={() => handleInputChange("occasion", occasion.value)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.occasion === occasion.value
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{occasion.icon}</div>
                        <div className="text-sm font-medium">{occasion.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gift For */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Who is this gift for?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {giftForOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange("giftFor", option.value)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.giftFor === option.value
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personality Type */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    What's their personality like?
                  </label>
                  <div className="space-y-2">
                    {personalityTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleInputChange("personalityType", type.value)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                          formData.personalityType === type.value
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                        }`}
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    What are their interests? (Select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleArrayToggle("interests", interest)}
                        className={`p-2 rounded-lg border-2 text-sm transition-colors ${
                          formData.interests.includes(interest)
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={generateSurpriseBox}
                  disabled={loading || !formData.budget}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Your Surprise Box...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate My Surprise Box
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Surprise Box Results */}
        {step === 3 && surpriseBox && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Gift className="h-12 w-12 text-purple-600 mr-3" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your AI Curated Surprise Box!</h2>
                  <Star className="h-8 w-8 text-yellow-500 ml-3" />
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    🎉 We've selected {surpriseBox.totalItems} amazing products for you within your budget of ₹
                    {surpriseBox.budget}!
                  </p>
                  <div className="flex justify-center items-center space-x-6 mt-4 text-sm">
                    <div className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full">
                      <span className="font-semibold">Total Cost: ₹{surpriseBox.totalCost}</span>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        You Save: ₹{surpriseBox.savings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {surpriseBox.products.map((product, index) => (
                  <div
                    key={product._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative mb-4">
                      <img
                        src={product.primaryImg?.url || "/placeholder.svg?height=200&width=200"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        #{index + 1}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.discountPrice && product.discountPrice < product.price ? (
                          <>
                            <span className="text-lg font-bold text-green-600">₹{product.discountPrice}</span>
                            <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < Math.floor(product.ratings || 0) ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({product.totalReviews || 0})</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={addAllToCart}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Add All to Cart (₹{surpriseBox.totalCost})
                </button>
                <button
                  onClick={regenerateSurpriseBox}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate New Box
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SurpriseBox
