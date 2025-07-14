"use client"

import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="text-center py-10">Loading...</div> // Or a spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
