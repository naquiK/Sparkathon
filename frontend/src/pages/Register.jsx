"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useWeather } from "../contexts/WeatherContext"
import { User, Mail, Lock, Phone, UserPlus } from "lucide-react"
import toast from "react-hot-toast"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNo: "",
  })
  const { register, loading } = useAuth()
  const { getThemeClasses } = useWeather()
  const navigate = useNavigate()

  const themeClasses = getThemeClasses()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    const { confirmPassword, ...dataToRegister } = formData // Exclude confirmPassword
    const success = await register(dataToRegister)
    if (success) {
      navigate("/login") // Redirect to login after successful registration
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${themeClasses.background}`}>
      <div
        className={`w-full max-w-md ${themeClasses.card} rounded-2xl shadow-xl p-8 border ${themeClasses.border} backdrop-blur-lg`}
      >
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>Create Your Account</h2>
          <p className={`${themeClasses.textSecondary}`}>Join eKart and start shopping together!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNo" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Phone Number
            </label>
            <div className="relative">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type="tel"
                id="phoneNo"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                placeholder="9876543210"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              "Registering..."
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Register
              </>
            )}
          </button>
        </form>

        <p className={`mt-8 text-center text-sm ${themeClasses.textSecondary}`}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
