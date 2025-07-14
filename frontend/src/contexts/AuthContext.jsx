"use client"

import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { jwtDecode } from "jwt-decode"
import toast from "react-hot-toast"

 const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true) // New loading state

  // Function to decode token and set user/admin state
  const decodeAndSetUser = useCallback((authToken) => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken)
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expired")
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
          setIsAuthenticated(false)
          setIsAdmin(false)
          return false
        }
        setToken(authToken)
        setIsAuthenticated(true)
        setIsAdmin(decoded.isAdmin || false)
        return true
      } catch (error) {
        console.error("Failed to decode token:", error)
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
        return false
      }
    } else {
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
      return false
    }
  }, [])

  // Fetch user data from backend
  const fetchUser = useCallback(async () => {
    setLoading(true)
    const storedToken = localStorage.getItem("token")
    if (!storedToken || !decodeAndSetUser(storedToken)) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
      } else {
        console.error("Failed to fetch user profile:", data.message)
        // If fetching user fails, clear token and logout
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
        toast.error("Session expired or invalid. Please log in again.")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      localStorage.removeItem("token")
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [decodeAndSetUser])

  // On initial load, try to get token from localStorage and fetch user
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(
    async (email, password) => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
        const data = await response.json()

        if (data.success) {
          localStorage.setItem("token", data.token)
          decodeAndSetUser(data.token)
          setUser(data.user)
          toast.success("Login successful!")
          return { success: true }
        } else {
          toast.error(data.message || "Login failed.")
          return { success: false, message: data.message }
        }
      } catch (error) {
        console.error("Login error:", error)
        toast.error("An error occurred during login.")
        return { success: false, message: "Network error." }
      } finally {
        setLoading(false)
      }
    },
    [decodeAndSetUser],
  )

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    toast.success("Logged out successfully!")
  }, [])

  const authContextValue = {
    token,
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
    fetchUser, // Expose fetchUser to allow manual refresh
  }

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext, useAuth }
