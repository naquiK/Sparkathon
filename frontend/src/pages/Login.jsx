"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useWeather } from "../contexts/WeatherContext"
import { Mail, Lock, LogIn } from "lucide-react"
import toast from "react-hot-toast"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading } = useAuth()
  const { getThemeClasses } = useWeather()
  const navigate = useNavigate()

  const themeClasses = getThemeClasses()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please enter both email and password.")
      return
    }

    const success = await login(email, password)
    if (success) {
      navigate("/")
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${themeClasses.background}`}>
      <div
        className={`w-full max-w-md ${themeClasses.card} rounded-2xl shadow-xl p-8 border ${themeClasses.border} backdrop-blur-lg`}
      >
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>Welcome Back!</h2>
          <p className={`${themeClasses.textSecondary}`}>Sign in to your account to continue shopping.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              "Signing In..."
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className={`mt-8 text-center text-sm ${themeClasses.textSecondary}`}>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
