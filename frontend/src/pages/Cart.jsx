"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useWeather } from "../contexts/WeatherContext"
import { ShoppingCart, Trash2, Plus, Minus, Tag, XCircle, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    getCartTotal,
    getDiscountAmount,
    getFinalTotal,
  } = useCart()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCodeInput.trim()) {
      toast.error("Please enter a coupon code.")
      return
    }
    setApplyingCoupon(true)
    const success = await applyCoupon(couponCodeInput)
    if (success) {
      setCouponCodeInput("") // Clear input on success
    }
    setApplyingCoupon(false)
  }

  const getProductImageUrl = (product) => {
    if (product?.primaryImg?.url) {
      return product.primaryImg.url
    }
    if (product?.images && product.images.length > 0) {
      return product.images[0].url
    }
    return "/placeholder.svg?height=100&width=100"
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold ${themeClasses.text} mb-8 text-center`}>Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingCart className={`w-24 h-24 ${themeClasses.accent} mx-auto mb-6 opacity-50`} />
            <h2 className={`text-2xl font-bold ${themeClasses.accent} mb-4`}>Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className={`${themeClasses.button} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className={`${themeClasses.card} p-4 rounded-xl shadow-lg flex items-center space-x-4`}
                >
                  <Link to={`/products/${item.product._id}`} className="flex-shrink-0">
                    <img
                      src={getProductImageUrl(item.product) || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-md border ${themeClasses.border}"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=100&width=100"
                      }}
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/products/${item.product._id}`}>
                      <h2
                        className={`text-lg font-semibold ${themeClasses.text} hover:${themeClasses.accent} transition-colors`}
                      >
                        {item.product.name}
                      </h2>
                    </Link>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>{item.product.category}</p>
                    <div className="flex items-center mt-2">
                      {item.product.discountPrice && item.product.discountPrice < item.product.price ? (
                        <>
                          <span className={`text-lg font-bold text-green-600`}>
                            ₹{item.product.discountPrice.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{item.product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className={`text-lg font-bold ${themeClasses.text}`}>
                          ₹{item.product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className={`p-2 rounded-full ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} transition-colors`}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className={`text-lg font-medium ${themeClasses.text}`}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className={`p-2 rounded-full ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} transition-colors`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full"
                    title="Remove from cart"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={clearCart}
                className={`w-full ${themeClasses.secondary} ${themeClasses.text} border ${themeClasses.border} py-3 rounded-lg hover:${themeClasses.cardBackground} transition-colors flex items-center justify-center`}
              >
                <XCircle size={20} className="mr-2" /> Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg sticky top-8`}>
                <h2 className={`text-xl font-bold ${themeClasses.text} mb-6`}>Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between ${themeClasses.textSecondary}">
                    <span>Subtotal:</span>
                    <span className={`${themeClasses.text}`}>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({coupon.code}):</span>
                      <span>- ₹{getDiscountAmount().toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between ${themeClasses.textSecondary}">
                    <span>Shipping:</span>
                    <span className={`${themeClasses.text}`}>Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold ${themeClasses.text}">Total:</span>
                    <span className={`text-2xl font-bold ${themeClasses.accent}`}>
                      ₹{getFinalTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className={`text-md font-semibold ${themeClasses.text} mb-3 flex items-center`}>
                    <Tag size={18} className="mr-2 ${themeClasses.accent}" /> Apply Coupon
                  </h3>
                  {coupon ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 p-3 rounded-lg">
                      <span>Coupon "{coupon.code}" applied!</span>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-800 flex items-center text-sm"
                      >
                        <XCircle size={16} className="mr-1" /> Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className={`flex-1 p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                        disabled={applyingCoupon}
                      />
                      <button
                        type="submit"
                        className={`${themeClasses.button} text-white px-4 py-2 rounded-lg`}
                        disabled={applyingCoupon}
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </button>
                    </form>
                  )}
                </div>

                <Link
                  to="/checkout"
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                    cartItems.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : `${themeClasses.button} hover:opacity-90`
                  } flex items-center justify-center`}
                >
                  Proceed to Checkout <ArrowRight size={20} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
