import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { WeatherProvider } from "./contexts/WeatherContext"
import { Toaster } from "react-hot-toast"

// Import pages
import Home from "./pages/Home"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ProductsManagement from "./pages/admin/ProductsManagement"
import CouponsManagement from "./pages/admin/CouponsManagement"
import ChatRooms from "./pages/ChatRooms"
import ChatRoom from "./pages/ChatRoom"
import CoShopping from "./pages/CoShopping"
import CoShoppingRoom from "./pages/CoShoppingRoom"
import SurpriseBox from "./pages/SurpriseBox"

// Import components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import AIAssistant from "./components/AIAssistant"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <WeatherProvider>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-128px)]">
              {" "}
              {/* Adjust min-height as needed */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} /> {/* Correct route for product details */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/surprise-box" element={<SurpriseBox />} />
                <Route path="/co-shopping" element={<CoShopping />} />
                <Route path="/co-shopping/:roomId" element={<CoShoppingRoom />} />
                <Route path="/chat-rooms" element={<ChatRooms />} />
                <Route path="/chat-room/:roomId" element={<ChatRoom />} />
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Route>
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<ProductsManagement />} />
                  <Route path="/admin/coupons" element={<CouponsManagement />} />
                </Route>
                {/* Fallback for 404 */}
                <Route
                  path="*"
                  element={<div className="text-center py-20 text-2xl font-bold">404 - Page Not Found</div>}
                />
              </Routes>
            </main>
            <AIAssistant />
            <Footer />
            <Toaster position="top-right" reverseOrder={false} />
          </CartProvider>
        </AuthProvider>
      </WeatherProvider>
    </Router>
  </React.StrictMode>,
)
