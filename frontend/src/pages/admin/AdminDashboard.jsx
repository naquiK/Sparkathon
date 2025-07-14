"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useWeather } from "../../contexts/WeatherContext"
import axios from "axios"
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  DollarSign,
  Star,
  Calendar,
  Tag,
  MessageCircle,
  Gift,
  ShoppingBag,
} from "lucide-react"
import toast from "react-hot-toast"
import ProductsManagement from "./ProductsManagement"
import CouponsManagement from "./CouponsManagement"
import { Link } from "react-router-dom"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    activeCoupons: 0,
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const { user, logout } = useAuth()
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Fetch dashboard stats
      const statsResponse = await axios.get("http://localhost:5000/api/products/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch recent products
      const productsResponse = await axios.get(
        "http://localhost:5000/api/products?limit=5&sortBy=createdAt&sortOrder=desc",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (statsResponse.data.success) {
        setStats({
          totalProducts: statsResponse.data.data.totalProducts || 0,
          totalUsers: statsResponse.data.data.totalUsers || 0,
          totalOrders: statsResponse.data.data.totalOrders || 0,
          totalRevenue: statsResponse.data.data.totalRevenue || 0,
          lowStockProducts: statsResponse.data.data.lowStockProducts || 0,
          activeCoupons: statsResponse.data.data.activeCoupons || 0,
        })
      }

      if (productsResponse.data.success) {
        setRecentProducts(productsResponse.data.data.products || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
  }

  const getImageUrl = (product) => {
    if (product?.primaryImg?.url) {
      return product.primaryImg.url
    }
    return "/placeholder.svg?height=40&width=40"
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={20} /> },
    { id: "products", label: "Products", icon: <Package size={20} /> },
    { id: "coupons", label: "Coupons", icon: <DollarSign size={20} /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ]

  const statsCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="w-8 h-8" />,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-8 h-8" />,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCart className="w-8 h-8" />,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Revenue",
      value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: <DollarSign className="w-8 h-8" />,
      color: "bg-yellow-500",
      change: "+23%",
    },
    {
      title: "Low Stock",
      value: stats.lowStockProducts,
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-red-500",
      change: "-5%",
    },
    {
      title: "Active Coupons",
      value: stats.activeCoupons,
      icon: <Star className="w-8 h-8" />,
      color: "bg-indigo-500",
      change: "+3%",
    },
  ]

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl animate-pulse border border-gray-200 dark:border-gray-700"
            >
              <div className="bg-gray-300 dark:bg-gray-600 h-20 rounded mb-4"></div>
              <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-green-500 text-sm mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getImageUrl(product) || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=40&width=40"
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      ₹{product.discountPrice || product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className={`${product.stock < 10 ? "text-red-500" : "text-green-500"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent()
      case "products":
        return <ProductsManagement />
      case "coupons":
        return <CouponsManagement />
      case "orders":
        return (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border border-gray-200 dark:border-gray-700">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Orders Management</h3>
            <p className="text-gray-600 dark:text-gray-400">Orders management feature coming soon...</p>
          </div>
        )
      case "users":
        return (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border border-gray-200 dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User Management</h3>
            <p className="text-gray-600 dark:text-gray-400">User management feature coming soon...</p>
          </div>
        )
      case "settings":
        return (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border border-gray-200 dark:border-gray-700">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Settings</h3>
            <p className="text-gray-600 dark:text-gray-400">Settings panel coming soon...</p>
          </div>
        )
      default:
        return renderDashboardContent()
    }
  }

  const adminLinks = [
    {
      name: "Product Management",
      description: "Manage products, add new, edit, or delete existing ones.",
      icon: <Package size={24} />,
      link: "/admin/products",
      color: "text-blue-500",
    },
    {
      name: "Coupon Management",
      description: "Create, update, and delete discount coupons.",
      icon: <Tag size={24} />,
      link: "/admin/coupons",
      color: "text-green-500",
    },
    {
      name: "User Management",
      description: "View and manage user accounts.",
      icon: <Users size={24} />,
      link: "/admin/users", // Assuming a user management page
      color: "text-purple-500",
    },
    {
      name: "Order Management",
      description: "Track and manage customer orders.",
      icon: <ShoppingBag size={24} />,
      link: "/admin/orders", // Assuming an order management page
      color: "text-orange-500",
    },
    {
      name: "Chat Room Moderation",
      description: "Monitor and moderate chat rooms.",
      icon: <MessageCircle size={24} />,
      link: "/admin/chat-moderation", // Assuming a chat moderation page
      color: "text-red-500",
    },
    {
      name: "Surprise Box Configuration",
      description: "Configure surprise box contents and rules.",
      icon: <Gift size={24} />,
      link: "/admin/surprise-box-config", // Assuming a surprise box config page
      color: "text-pink-500",
    },
    {
      name: "Sales Reports",
      description: "View sales data and generate reports.",
      icon: <DollarSign size={24} />,
      link: "/admin/sales-reports", // Assuming a sales reports page
      color: "text-teal-500",
    },
  ]

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} py-8`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:inset-0 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">eKart Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user?.profilePic?.url || "/placeholder.svg?height=40&width=40"}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=40&width=40"
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu size={24} />
              </button>
              <h2 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {activeTab}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={16} className="inline mr-1" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {activeTab === "dashboard" ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className={`text-4xl font-extrabold ${themeClasses.text} mb-8 text-center`}>
                Admin <span className={themeClasses.accent}>Dashboard</span>
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.link}
                    className={`${themeClasses.card} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center`}
                  >
                    <div className={`mb-4 p-3 rounded-full ${link.color} bg-opacity-10`}>{link.icon}</div>
                    <h2 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>{link.name}</h2>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
