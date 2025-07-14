"use client"

import { createContext, useState, useEffect, useContext } from "react"
import toast from "react-hot-toast"
import { useAuth } from "./AuthContext" // Corrected import

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    if (!isAuthenticated || !token) {
      setCartItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCartItems(data.cart)
      } else {
        console.error("Failed to fetch cart items:", data.message)
        setCartItems([])
      }
    } catch (error) {
      console.error("Error fetching cart items:", error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [token, isAuthenticated]) // Re-fetch when token or auth status changes

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.")
      return
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await response.json()
      if (data.success) {
        setCartItems(data.cart)
        toast.success("Item added to cart!")
      } else {
        toast.error(data.message || "Failed to add item to cart.")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("An error occurred while adding to cart.")
    }
  }

  const updateCartItemQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      toast.error("Please log in to update your cart.")
      return
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await response.json()
      if (data.success) {
        setCartItems(data.cart)
        toast.success("Cart updated!")
      } else {
        toast.error(data.message || "Failed to update cart.")
      }
    } catch (error) {
      console.error("Error updating cart:", error)
      toast.error("An error occurred while updating cart.")
    }
  }

  const removeCartItem = async (productId) => {
    if (!isAuthenticated) {
      toast.error("Please log in to remove items from your cart.")
      return
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })
      const data = await response.json()
      if (data.success) {
        setCartItems(data.cart)
        toast.success("Item removed from cart!")
      } else {
        toast.error(data.message || "Failed to remove item from cart.")
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast.error("An error occurred while removing from cart.")
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to clear your cart.")
      return
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCartItems([])
        toast.success("Cart cleared!")
      } else {
        toast.error(data.message || "Failed to clear cart.")
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast.error("An error occurred while clearing cart.")
    }
  }

  const cartTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0)

  const cartContextValue = {
    cartItems,
    loading,
    cartTotal,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    fetchCartItems, // Expose fetchCartItems for manual refresh if needed
  }

  return <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
