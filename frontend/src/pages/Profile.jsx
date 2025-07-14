"use client"

import { useState, useContext, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useWeather } from "../contexts/WeatherContext"
import { User, MapPin, Camera, Edit, Plus, Trash2, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

const Profile = () => {
  const {
    user,
    updateUserProfile,
    uploadProfilePicture,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loading: authLoading,
  } = useContext(useAuth)
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const [activeTab, setActiveTab] = useState("profile")
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profilePicFile, setProfilePicFile] = useState(null)
  const [profilePicPreview, setProfilePicPreview] = useState(null)

  const [showAddressModal, setShowAddressModal] = useState(false)
  const [currentAddress, setCurrentAddress] = useState(null) // For editing
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isDefault: false,
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phoneNo || "",
      })
      setProfilePicPreview(user.profilePic?.url || null)
    }
  }, [user])

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    const success = await updateUserProfile(profileForm)
    if (success) {
      setIsEditingProfile(false)
    }
  }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicFile(file)
      setProfilePicPreview(URL.createObjectURL(file))
    }
  }

  const handleProfilePicUpload = async () => {
    if (profilePicFile) {
      const success = await uploadProfilePicture(profilePicFile)
      if (success) {
        setProfilePicFile(null) // Clear file input after upload
      }
    } else {
      toast.error("No new image selected.")
    }
  }

  const openAddressModal = (address = null) => {
    if (address) {
      setCurrentAddress(address)
      setAddressForm({
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        isDefault: address.isDefault,
      })
    } else {
      setCurrentAddress(null)
      setAddressForm({
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
    setCurrentAddress(null)
    setAddressForm({
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      isDefault: false,
    })
  }

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...addressForm }
    let success

    if (currentAddress) {
      success = await updateAddress(currentAddress._id, payload)
    } else {
      success = await addAddress(payload)
    }

    if (success) {
      closeAddressModal()
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      await deleteAddress(addressId)
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    await setDefaultAddress(addressId)
  }

  if (authLoading) {
    return <div className="text-center py-10">Loading profile...</div>
  }

  if (!user) {
    return <div className="text-center py-10 text-red-500">Please log in to view your profile.</div>
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold ${themeClasses.text} mb-8 text-center`}>My Profile</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-1/4">
            <div className={`${themeClasses.card} p-4 rounded-xl shadow-lg`}>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors ${
                  activeTab === "profile"
                    ? `bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold`
                    : `${themeClasses.textSecondary} hover:${themeClasses.cardBackground}`
                }`}
              >
                <User size={20} /> <span>Personal Info</span>
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors mt-2 ${
                  activeTab === "addresses"
                    ? `bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold`
                    : `${themeClasses.textSecondary} hover:${themeClasses.cardBackground}`
                }`}
              >
                <MapPin size={20} /> <span>My Addresses</span>
              </button>
              {/* Add more tabs as needed, e.g., Orders, Security */}
            </div>
          </div>

          {/* Content Area */}
          <div className="md:w-3/4">
            {activeTab === "profile" && (
              <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg`}>
                <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>Personal Information</h2>

                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                    <img
                      src={profilePicPreview || user.profilePic?.url || "/placeholder.svg?height=128&width=128"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=128&width=128"
                      }}
                    />
                    <label
                      htmlFor="profilePicInput"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                      title="Change Profile Picture"
                    >
                      <Camera size={20} />
                      <input
                        id="profilePicInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePicChange}
                      />
                    </label>
                  </div>
                  {profilePicFile && (
                    <button
                      onClick={handleProfilePicUpload}
                      className={`${themeClasses.button} text-white px-4 py-2 rounded-lg mt-4 flex items-center`}
                    >
                      <Camera size={18} className="mr-2" /> Upload Photo
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-4">
                    <label htmlFor="name" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileFormChange}
                      disabled={!isEditingProfile}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md ${!isEditingProfile ? "bg-gray-100 dark:bg-gray-700" : ""} focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileFormChange}
                      disabled={!isEditingProfile}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md ${!isEditingProfile ? "bg-gray-100 dark:bg-gray-700" : ""} focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="phone" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileFormChange}
                      disabled={!isEditingProfile}
                      className={`w-full p-2 border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} rounded-md ${!isEditingProfile ? "bg-gray-100 dark:bg-gray-700" : ""} focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    {isEditingProfile ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false)
                            setProfileForm({
                              name: user.name || "",
                              email: user.email || "",
                              phone: user.phoneNo || "",
                            })
                          }}
                          className={`px-4 py-2 rounded-lg ${themeClasses.secondary} ${themeClasses.text} hover:${themeClasses.cardBackground} transition-colors`}
                        >
                          Cancel
                        </button>
                        <button type="submit" className={`${themeClasses.button} text-white px-4 py-2 rounded-lg`}>
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className={`${themeClasses.button} text-white px-4 py-2 rounded-lg flex items-center`}
                      >
                        <Edit size={18} className="mr-2" /> Edit Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg`}>
                <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>My Addresses</h2>

                {user.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {user.addresses.map((address) => (
                      <div key={address._id} className={`p-4 border ${themeClasses.border} rounded-lg`}>
                        <div className="flex justify-between items-center mb-2">
                          <p className={`font-medium ${themeClasses.text}`}>
                            {address.street}, {address.city}, {address.state}, {address.zip}, {address.country}
                          </p>
                          {address.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-3 text-sm">
                          <button
                            onClick={() => openAddressModal(address)}
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <Edit size={16} className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="text-red-600 hover:underline flex items-center"
                          >
                            <Trash2 size={16} className="mr-1" /> Delete
                          </button>
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address._id)}
                              className="text-green-600 hover:underline flex items-center"
                            >
                              <CheckCircle size={16} className="mr-1" /> Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className={`${themeClasses.textSecondary} mb-4`}>No addresses found. Please add one.</p>
                  </div>
                )}
                <button
                  onClick={() => openAddressModal()}
                  className={`w-full mt-6 py-2 rounded-lg ${themeClasses.button} text-white flex items-center justify-center`}
                >
                  <Plus size={20} className="mr-2" /> Add New Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${themeClasses.card} rounded-lg shadow-xl w-full max-w-md p-6`}>
              <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>
                {currentAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <form onSubmit={handleAddressSubmit}>
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
                    {currentAddress ? "Update Address" : "Add Address"}
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

export default Profile
