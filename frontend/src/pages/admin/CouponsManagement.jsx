"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useWeather } from "../../contexts/WeatherContext"
import toast from "react-hot-toast"
import axios from "axios"

const CouponsManagement = () => {
  const { token } = useAuth()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCoupon, setCurrentCoupon] = useState(null) // For editing
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "fixed", // 'fixed' or 'percentage'
    discountValue: "",
    minOrderValue: "",
    maxDiscountValue: "",
    expiryDate: "",
    isActive: true,
    applicableCategories: [],
  })
  const [submitting, setSubmitting] = useState(false)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    fetchCoupons()
  }, [token])

  const fetchCoupons = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${BACKEND_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCoupons(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch coupons.")
      toast.error(err.response?.data?.message || "Failed to fetch coupons.")
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === "applicableCategories") {
      const category = value
      setForm((prev) => ({
        ...prev,
        applicableCategories: prev.applicableCategories.includes(category)
          ? prev.applicableCategories.filter((c) => c !== category)
          : [...prev.applicableCategories, category],
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const openModal = (coupon = null) => {
    if (coupon) {
      setCurrentCoupon(coupon)
      setForm({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue || "",
        maxDiscountValue: coupon.maxDiscountValue || "",
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
        isActive: coupon.isActive,
        applicableCategories: coupon.applicableCategories || [],
      })
    } else {
      setCurrentCoupon(null)
      setForm({
        code: "",
        description: "",
        discountType: "fixed",
        discountValue: "",
        minOrderValue: "",
        maxDiscountValue: "",
        expiryDate: "",
        isActive: true,
        applicableCategories: [],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentCoupon(null)
    setForm({
      code: "",
      description: "",
      discountType: "fixed",
      discountValue: "",
      minOrderValue: "",
      maxDiscountValue: "",
      expiryDate: "",
      isActive: true,
      applicableCategories: [],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
        maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      }

      let response
      if (currentCoupon) {
        response = await axios.put(`${BACKEND_URL}/api/coupons/${currentCoupon._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Coupon updated successfully!")
      } else {
        response = await axios.post(`${BACKEND_URL}/api/coupons`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Coupon created successfully!")
      }
      fetchCoupons()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save coupon.")
      toast.error(err.response?.data?.message || "Failed to save coupon.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return

    try {
      await axios.delete(`${BACKEND_URL}/api/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Coupon deleted successfully!")
      fetchCoupons()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coupon.")
      toast.error(err.response?.data?.message || "Failed to delete coupon.")
    }
  }

  // Dummy categories for applicableCategories dropdown
  const dummyCategories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports", "Beauty"]

  if (loading) return <div className="text-center py-10">Loading coupons...</div>
  if (error && !coupons.length) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Coupon Management</h1>
          <button
            onClick={() => openModal()}
            className={`${themeClasses.button} text-white px-4 py-2 rounded-lg flex items-center`}
          >
            <Plus size={20} className="mr-2" /> Add New Coupon
          </button>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-10">
            <p className={`${themeClasses.textSecondary} text-lg`}>No coupons found. Start by adding a new one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full ${themeClasses.card} rounded-lg shadow-md`}>
              <thead className={`${themeClasses.secondary} rounded-t-lg`}>
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider rounded-tl-lg">
                    Code
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Min Order
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClasses.border}`}>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className={`hover:${themeClasses.cardBackground}`}>
                    <td className={`py-3 px-4 whitespace-nowrap font-medium ${themeClasses.text}`}>{coupon.code}</td>
                    <td className={`py-3 px-4 ${themeClasses.textSecondary}`}>{coupon.description}</td>
                    <td className={`py-3 px-4 whitespace-nowrap ${themeClasses.text}`}>
                      {coupon.discountType === "fixed" ? "₹" : ""}
                      {coupon.discountValue}
                      {coupon.discountType === "percentage" ? "%" : ""}
                      {coupon.maxDiscountValue > 0 && ` (Max ₹${coupon.maxDiscountValue})`}
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap ${themeClasses.text}`}>
                      {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : "N/A"}
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap ${themeClasses.textSecondary}`}>
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Never"}
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap`}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(coupon)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Add/Edit Coupon */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${themeClasses.card} rounded-lg shadow-xl w-full max-w-lg p-6`}>
              <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>
                {currentCoupon ? "Edit Coupon" : "Add New Coupon"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="code" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={form.code}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="discountType"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                    >
                      Discount Type
                    </label>
                    <select
                      id="discountType"
                      name="discountType"
                      value={form.discountType}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="fixed">Fixed Amount (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="discountValue"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                    >
                      Discount Value
                    </label>
                    <input
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      value={form.discountValue}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="minOrderValue"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                    >
                      Minimum Order Value (₹)
                    </label>
                    <input
                      type="number"
                      id="minOrderValue"
                      name="minOrderValue"
                      value={form.minOrderValue}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {form.discountType === "percentage" && (
                  <div className="mb-4">
                    <label
                      htmlFor="maxDiscountValue"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                    >
                      Maximum Discount Value (₹)
                    </label>
                    <input
                      type="number"
                      id="maxDiscountValue"
                      name="maxDiscountValue"
                      value={form.maxDiscountValue}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="3"
                    className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="expiryDate"
                    className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                  >
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleFormChange}
                    className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                    Applicable Categories
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {dummyCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`cat-${category}`}
                          name="applicableCategories"
                          value={category}
                          checked={form.applicableCategories.includes(category)}
                          onChange={handleFormChange}
                          className="mr-2"
                        />
                        <label htmlFor={`cat-${category}`} className={`text-sm ${themeClasses.text}`}>
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className={`text-sm font-medium ${themeClasses.text}`}>
                    Is Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`px-4 py-2 rounded-lg ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded-lg`}
                  >
                    {submitting ? "Saving..." : currentCoupon ? "Update Coupon" : "Add Coupon"}
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

export default CouponsManagement
