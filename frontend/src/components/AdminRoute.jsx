"use client"

import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="text-center py-10">Loading...</div> // Or a spinner
  }

  // Check if authenticated and user role is admin
  if (isAuthenticated && user && user.role === "admin") {
    return <Outlet />
  } else {
    // Redirect to login or a forbidden page if not admin
    return <Navigate to="/login" replace />
  }
}

export default AdminRoute
