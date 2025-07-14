"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import { useWeather } from "../contexts/WeatherContext"
import { MapPin, CreditCard, Package, CheckCircle, Loader2, Plus } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"

const Checkout = () => {
  const { user, token, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth()
  const { cartItems, getCartTotal, coupon, getFinalTotal, clearCart } = useCart()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()
  const navigate = useNavigate()

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cod") // 'cod' or 'card'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressForm, setAddressForm] = useState({
    _id: null, // For editing existing address
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isDefault: false,
  })

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((addr) => addr.isDefault)
      setSelectedAddress(defaultAddr || user.addresses[0])
    }
  }, [user?.addresses])

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const openAddressModal = (address = null) => {
    if (address) {
      setAddressForm({
        _id: address._id,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        isDefault: address.isDefault,
      })
    } else {
      setAddressForm({
        _id: null,
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        isDefault: false,
      })
    }
    setShowAddressModal(true)
  }

  const closeAddressModal = () => {
    setShowAddressModal(false)
    setAddressForm({
      _id: null,
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      isDefault: false,
    })
  }

  const handleAddressFormSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...addressForm }
    delete payload._id // Don't send _id in payload for add

    let success
    if (addressForm._id) {
      success = await updateAddress(addressForm._id, payload)
    } else {
      success = await addAddress(payload)
    }

    if (success) {
      closeAddressModal()
      // Re-select the address if it was the one being edited or if it's the new default
      if (addressForm._id === selectedAddress?._id || payload.isDefault) {
        const updatedUser = await axios.get(`${BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const updatedAddresses = updatedUser.data.user.addresses
        const newSelected =
          updatedAddresses.find((addr) => addr._id === addressForm._id) ||
          updatedAddresses.find((addr) => addr.isDefault) ||
          updatedAddresses[0]
        setSelectedAddress(newSelected)
      }
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const success = await deleteAddress(addressId)
      if (success) {
        if (selectedAddress?._id === addressId) {
          setSelectedAddress(null) // Deselect if the current address is deleted
        }
      }
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    await setDefaultAddress(addressId)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address.")
      return
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.")
      return
    }

    setIsPlacingOrder(true)
    try {
      const orderData = {
        shippingInfo: {
          address: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
          pinCode: selectedAddress.zip,
        },
        orderItems: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
          image: item.product.primaryImg?.url || item.product.images[0]?.url,
        })),
        paymentMethod,
        itemsPrice: getCartTotal(),
        shippingPrice: 0, // Assuming free shipping for now
        totalPrice: getFinalTotal(),
        coupon: coupon?._id || null,
      }

      const response = await axios.post(`${BACKEND_URL}/api/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success("Order placed successfully!")
        clearCart() // Clear cart after successful order
        navigate("/order-success", { state: { order: response.data.order } }) // Navigate to a success page
      } else {
        toast.error(response.data.message || "Failed to place order.")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error(error.response?.data?.message || "An error occurred while placing the order.")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (!user) {
    return <div className="text-center py-10">Please log in to proceed to checkout.</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className={`w-24 h-24 ${themeClasses.accent} mx-auto mb-6 opacity-50`} />
          <h2 className={`text-2xl font-bold ${themeClasses.accent} mb-4`}>Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Add items to your cart before proceeding to checkout.</p>
          {/* Link component is not imported, assuming it's used elsewhere */}
          {/* <Link
            to="/products"
            className={`${themeClasses.button} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
          >
            Start Shopping
          </Link> */}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold ${themeClasses.text} mb-8 text-center`}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Address */}
          <div className="lg:col-span-2">
            <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg mb-6`}>
              <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center`}>
                <MapPin size={20} className="mr-2 ${themeClasses.accent}" /> Shipping Address
              </h2>
              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedAddress?._id === address._id
                          ? `border-blue-500 ring-2 ring-blue-200 ${themeClasses.secondary}`
                          : `${themeClasses.border} hover:${themeClasses.cardBackground}`
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex justify-between items-center">
                        <p className={`font-medium ${themeClasses.text}`}>
                          {address.street}, {address.city}, {address.state}, {address.zip}, {address.country}
                        </p>
                        {address.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2 mt-2 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openAddressModal(address)
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAddress(address._id)
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                        {!address.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetDefaultAddress(address._id)
                            }}
                            className="text-green-600 hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openAddressModal()}
                    className={`w-full ${themeClasses.secondary} ${themeClasses.text} border ${themeClasses.border} py-2 rounded-lg hover:${themeClasses.cardBackground} transition-colors flex items-center justify-center`}
                  >
                    <Plus size={18} className="mr-2" /> Add New Address
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className={`${themeClasses.textSecondary} mb-4`}>No addresses found. Please add one.</p>
                  <button
                    onClick={() => openAddressModal()}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded-lg`}
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg`}>
              <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center`}>
                <CreditCard size={20} className="mr-2 ${themeClasses.accent}" /> Payment Method
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "cod"
                      ? `border-blue-500 ring-2 ring-blue-200 ${themeClasses.secondary}`
                      : `${themeClasses.border} hover:${themeClasses.cardBackground}`
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => handlePaymentMethodChange("cod")}
                    className="mr-3"
                  />
                  <span className={`${themeClasses.text} font-medium`}>Cash on Delivery (COD)</span>
                </label>
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "card"
                      ? `border-blue-500 ring-2 ring-blue-200 ${themeClasses.secondary}`
                      : `${themeClasses.border} hover:${themeClasses.cardBackground}`
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => handlePaymentMethodChange("card")}
                    className="mr-3"
                  />
                  <span className={`${themeClasses.text} font-medium`}>Credit/Debit Card (Coming Soon)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg sticky top-8`}>
              <h2 className={`text-xl font-bold ${themeClasses.text} mb-6`}>Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm ${themeClasses.textSecondary}">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>
                      ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between font-medium ${themeClasses.text}">
                    <span>Subtotal:</span>
                    <span>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Coupon Discount:</span>
                      <span>
                        - ₹
                        {(coupon.discountType === "percentage"
                          ? getCartTotal() * (coupon.discountValue / 100)
                          : coupon.discountValue
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium ${themeClasses.text}">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
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

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddress || paymentMethod === "card"}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                  isPlacingOrder || !selectedAddress || paymentMethod === "card"
                    ? "bg-gray-400 cursor-not-allowed"
                    : `${themeClasses.button} hover:opacity-90`
                } flex items-center justify-center`}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" /> Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" /> Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${themeClasses.card} rounded-lg shadow-xl w-full max-w-md p-6`}>
              <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>
                {addressForm._id ? "Edit Address" : "Add New Address"}
              </h2>
              <form onSubmit={handleAddressFormSubmit}>
                <div className="mb-4">
                  <label htmlFor="street" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={addressForm.street}
                    onChange={handleAddressFormChange}
                    className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="city" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="zip" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Zip Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={addressForm.zip}
                      onChange={handleAddressFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressFormChange}
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className={`text-sm font-medium ${themeClasses.text}`}>
                    Set as Default Address
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeAddressModal}
                    className={`px-4 py-2 rounded-lg ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={`${themeClasses.button} text-white px-4 py-2 rounded-lg`}>
                    {addressForm._id ? "Update Address" : "Add Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
