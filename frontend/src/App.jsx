"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { WeatherProvider } from "./contexts/WeatherContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AIAssistant from "./components/AIAssistant"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import Home from "./pages/Home"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import SurpriseBox from "./pages/SurpriseBox"
import CoShopping from "./pages/CoShopping"
import CoShoppingRoom from "./pages/CoShoppingRoom"
import ChatRooms from "./pages/ChatRooms"
import ChatRoom from "./pages/ChatRoom"
import AdminDashboard from "./pages/admin/AdminDashboard"
import "./App.css"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function App() {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <WeatherProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/surprise-box"
                    element={
                      <ProtectedRoute>
                        <SurpriseBox />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/co-shopping"
                    element={
                      <ProtectedRoute>
                        <CoShopping />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/co-shopping/:roomId"
                    element={
                      <ProtectedRoute>
                        <CoShoppingRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat-rooms"
                    element={
                      <ProtectedRoute>
                        <ChatRooms />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat/:roomId"
                    element={
                      <ProtectedRoute>
                        <ChatRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
              <AIAssistant />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: "green",
                      secondary: "black",
                    },
                  },
                }}
              />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </WeatherProvider>
  )
}

export default App
