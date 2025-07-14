"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useWeather } from "../../contexts/WeatherContext"
import toast from "react-hot-toast"
import axios from "axios"

const ProductsManagement = () => {
  const { token } = useAuth()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null) // For editing
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    stock: "",
    size: "",
    specification: {},
    primaryImg: null,
    additionalImgs: [],
  })
  const [formImages, setFormImages] = useState({
    primaryImgFile: null,
    additionalImgFiles: [],
    primaryImgPreview: null,
    additionalImgsPreview: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    fetchProducts()
  }, [token])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProducts(response.data.data) // Access data.data as per productController
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products.")
      toast.error(err.response?.data?.message || "Failed to fetch products.")
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      specification: {
        ...prev.specification,
        [name]: value,
      },
    }))
  }

  const handleImageChange = (e) => {
    const { name, files } = e.target
    if (name === "primaryImgFile") {
      setFormImages((prev) => ({
        ...prev,
        primaryImgFile: files[0],
        primaryImgPreview: files[0] ? URL.createObjectURL(files[0]) : null,
      }))
    } else if (name === "additionalImgFiles") {
      const newFiles = Array.from(files)
      setFormImages((prev) => ({
        ...prev,
        additionalImgFiles: [...prev.additionalImgFiles, ...newFiles],
        additionalImgsPreview: [...prev.additionalImgsPreview, ...newFiles.map((file) => URL.createObjectURL(file))],
      }))
    }
  }

  const removeAdditionalImage = (indexToRemove) => {
    setFormImages((prev) => ({
      ...prev,
      additionalImgFiles: prev.additionalImgFiles.filter((_, index) => index !== indexToRemove),
      additionalImgsPreview: prev.additionalImgsPreview.filter((_, index) => index !== indexToRemove),
    }))
  }

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product)
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || "",
        category: product.category,
        brand: product.brand || "",
        stock: product.stock,
        size: product.size || "",
        specification: product.specification || {},
        primaryImg: product.primaryImg || null,
        additionalImgs: product.images || [],
      })
      setFormImages({
        primaryImgFile: null,
        additionalImgFiles: [],
        primaryImgPreview: product.primaryImg?.url || null,
        additionalImgsPreview: product.images?.map((img) => img.url) || [],
      })
    } else {
      setCurrentProduct(null)
      setForm({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "",
        brand: "",
        stock: "",
        size: "",
        specification: {},
        primaryImg: null,
        additionalImgs: [],
      })
      setFormImages({
        primaryImgFile: null,
        additionalImgFiles: [],
        primaryImgPreview: null,
        additionalImgsPreview: [],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentProduct(null)
    setForm({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "",
      brand: "",
      stock: "",
      size: "",
      specification: {},
      primaryImg: null,
      additionalImgs: [],
    })
    setFormImages({
      primaryImgFile: null,
      additionalImgFiles: [],
      primaryImgPreview: null,
      additionalImgsPreview: [],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append("name", form.name)
    formData.append("description", form.description)
    formData.append("price", form.price)
    formData.append("category", form.category)
    formData.append("stock", form.stock)

    if (form.discountPrice) formData.append("discountPrice", form.discountPrice)
    if (form.brand) formData.append("brand", form.brand)
    if (form.size) formData.append("size", form.size)
    if (Object.keys(form.specification).length > 0) {
      formData.append("specification", JSON.stringify(form.specification))
    }

    if (formImages.primaryImgFile) {
      formData.append("primaryImg", formImages.primaryImgFile)
    } else if (currentProduct && currentProduct.primaryImg) {
      // If no new primary image, but there was an old one, keep its data
      formData.append("primaryImgUrl", currentProduct.primaryImg.url)
      formData.append("primaryImgPublicId", currentProduct.primaryImg.publicId)
    }

    formImages.additionalImgFiles.forEach((file) => {
      formData.append("additionalImgs", file)
    })

    // If editing, and no new additional images are uploaded, retain existing ones
    if (currentProduct && formImages.additionalImgFiles.length === 0 && currentProduct.images.length > 0) {
      formData.append("existingAdditionalImgs", JSON.stringify(currentProduct.images))
    }

    try {
      let response
      if (currentProduct) {
        response = await axios.put(`${BACKEND_URL}/api/products/${currentProduct._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        toast.success("Product updated successfully!")
      } else {
        response = await axios.post(`${BACKEND_URL}/api/products`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        toast.success("Product created successfully!")
      }
      fetchProducts()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.")
      toast.error(err.response?.data?.message || "Failed to save product.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return

    try {
      await axios.delete(`${BACKEND_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Product deleted successfully!")
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product.")
      toast.error(err.response?.data?.message || "Failed to delete product.")
    }
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) return <div className="text-center py-10">Loading products...</div>
  if (error && !products.length) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Product Management</h1>
          <button
            onClick={() => openModal()}
            className={`${themeClasses.button} text-white px-4 py-2 rounded-lg flex items-center`}
          >
            <Plus size={20} className="mr-2" /> Add New Product
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm font-medium`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className={`${themeClasses.textSecondary} text-lg`}>No products found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full ${themeClasses.card} rounded-lg shadow-md`}>
              <thead className={`${themeClasses.secondary} rounded-t-lg`}>
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider rounded-tl-lg">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold ${themeClasses.textSecondary} uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClasses.border}`}>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className={`hover:${themeClasses.cardBackground}`}>
                    <td className="py-3 px-4">
                      <img
                        src={product.primaryImg?.url || "/placeholder.svg?height=50&width=50"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=50&width=50"
                        }}
                      />
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap font-medium ${themeClasses.text}`}>{product.name}</td>
                    <td className={`py-3 px-4 ${themeClasses.textSecondary}`}>{product.category}</td>
                    <td className={`py-3 px-4 whitespace-nowrap ${themeClasses.text}`}>
                      ₹{product.price.toLocaleString()}
                      {product.discountPrice > 0 && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₹{product.discountPrice.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap ${themeClasses.text}`}>{product.stock}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
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

        {/* Modal for Add/Edit Product */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${themeClasses.card} rounded-lg shadow-xl w-full max-w-2xl p-6 my-8`}>
              <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>
                {currentProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="category"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="price" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={form.price}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="discountPrice"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                    >
                      Discount Price (₹)
                    </label>
                    <input
                      type="number"
                      id="discountPrice"
                      name="discountPrice"
                      value={form.discountPrice}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="brand" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Brand
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={form.brand}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label htmlFor="stock" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Stock
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={form.stock}
                      onChange={handleFormChange}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                      min="0"
                    />
                  </div>
                </div>

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
                    rows="4"
                    className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="size" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                    Size (Optional)
                  </label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={form.size}
                    onChange={handleFormChange}
                    className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>

                <div className="mb-4">
                  <h3 className={`text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                    Specifications (Key-Value Pairs)
                  </h3>
                  {Object.entries(form.specification).map(([key, value]) => (
                    <div key={key} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className={`w-1/3 p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md bg-gray-100 dark:bg-gray-700`}
                      />
                      <input
                        type="text"
                        name={key}
                        value={value}
                        onChange={handleSpecificationChange}
                        className={`w-2/3 p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSpecs = { ...form.specification }
                          delete newSpecs[key]
                          setForm((prev) => ({ ...prev, specification: newSpecs }))
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newKey = prompt("Enter new specification key:")
                      if (newKey && !form.specification[newKey]) {
                        setForm((prev) => ({
                          ...prev,
                          specification: { ...prev.specification, [newKey]: "" },
                        }))
                      } else if (newKey) {
                        toast.error("Key already exists or is invalid.")
                      }
                    }}
                    className="mt-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    Add Specification
                  </button>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="primaryImgFile"
                    className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                  >
                    Primary Image
                  </label>
                  <input
                    type="file"
                    id="primaryImgFile"
                    name="primaryImgFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {formImages.primaryImgPreview && (
                    <div className="mt-2 relative w-32 h-32">
                      <img
                        src={formImages.primaryImgPreview || "/placeholder.svg"}
                        alt="Primary Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormImages((prev) => ({ ...prev, primaryImgFile: null, primaryImgPreview: null }))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="additionalImgFiles"
                    className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}
                  >
                    Additional Images (Max 5)
                  </label>
                  <input
                    type="file"
                    id="additionalImgFiles"
                    name="additionalImgFiles"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    disabled={formImages.additionalImgFiles.length + form.additionalImgs.length >= 5}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formImages.additionalImgsPreview.map((imgSrc, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img
                          src={imgSrc || "/placeholder.svg"}
                          alt={`Additional Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {currentProduct &&
                      currentProduct.images &&
                      currentProduct.images.map(
                        (img, index) =>
                          // Display existing images if no new ones are uploaded for this slot
                          !formImages.additionalImgFiles.some((file) => file.name === img.url.split("/").pop()) && (
                            <div key={img.public_id || index} className="relative w-24 h-24">
                              <img
                                src={img.url || "/placeholder.svg"}
                                alt={`Existing Additional ${index + 1}`}
                                className="w-full h-full object-cover rounded-md opacity-70"
                              />
                              {/* Option to remove existing image if needed, requires backend logic */}
                              <span className="absolute top-1 left-1 text-xs bg-gray-800 text-white px-1 rounded">
                                Existing
                              </span>
                            </div>
                          ),
                      )}
                  </div>
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
                    {submitting ? "Saving..." : currentProduct ? "Update Product" : "Add Product"}
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

export default ProductsManagement
