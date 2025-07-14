"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const WeatherContext = createContext()

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null)
  const [values, setValues] = useState([])
  const [place, setPlace] = useState("Jaipur")
  const [thisLocation, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("default")

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      setIsDarkMode(savedTheme === "dark")
    } else {
      const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      setCurrentTheme(prefersDarkMode ? "dark" : "light")
      setIsDarkMode(prefersDarkMode)
    }

    const savedCity = localStorage.getItem("userCity")
    if (savedCity) {
      setPlace(savedCity)
    }
  }, [])

  // Apply theme classes to body
  useEffect(() => {
    const body = document.body
    body.classList.remove("theme-light", "theme-dark", "theme-sunny", "theme-cloudy", "theme-rainy", "theme-snowy")
    body.classList.add(`theme-${currentTheme}`)

    setIsDarkMode(
      currentTheme === "dark" || currentTheme === "cloudy" || currentTheme === "rainy" || currentTheme === "snowy",
    )
  }, [currentTheme])

  // Fetch weather using Visual Crossing API
  const fetchWeather = useCallback(async () => {
    if (!import.meta.env.VITE_WEATHER_API_KEY) {
      console.warn("Weather API key not found. Using default theme.")
      return
    }

    const options = {
      method: "GET",
      url: "https://visual-crossing-weather.p.rapidapi.com/forecast",
      params: {
        aggregateHours: "24",
        location: place,
        contentType: "json",
        unitGroup: "metric",
        shortColumnNames: 0,
      },
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_WEATHER_API_KEY,
        "X-RapidAPI-Host": "visual-crossing-weather.p.rapidapi.com",
      },
    }

    try {
      setLoading(true)
      const response = await axios.request(options)

      if (response.data && response.data.locations) {
        const thisData = Object.values(response.data.locations)[0]
        setLocation(thisData.address)
        setValues(thisData.values)
        setWeather(thisData.values[0])

        // Determine theme based on weather conditions
        const conditions = thisData.values[0].conditions?.toLowerCase() || ""
        let newTheme = "default"

        if (conditions.includes("clear") || conditions.includes("sunny")) {
          newTheme = "sunny"
        } else if (conditions.includes("cloud") || conditions.includes("overcast")) {
          newTheme = "cloudy"
        } else if (conditions.includes("rain") || conditions.includes("drizzle") || conditions.includes("storm")) {
          newTheme = "rainy"
        } else if (conditions.includes("snow") || conditions.includes("blizzard")) {
          newTheme = "snowy"
        }

        // Only apply weather theme if user hasn't manually set one
        setCurrentTheme(newTheme)

        toast.success(`Weather updated for ${thisData.address}`)
      }
    } catch (error) {
      console.error("Weather API Error:", error)
      // Don't show error toast for API issues, just use default theme
      if (!localStorage.getItem("theme")) {
        setCurrentTheme("default")
      }
    } finally {
      setLoading(false)
    }
  }, [place])

  const fetchWeatherByCity = useCallback(async (city) => {
    if (!city) return
    setPlace(city)
    localStorage.setItem("userCity", city)
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [place, fetchWeather])

  const changeTheme = useCallback((themeName) => {
    setCurrentTheme(themeName)
    setIsDarkMode(themeName === "dark" || themeName === "cloudy" || themeName === "rainy" || themeName === "snowy")
    localStorage.setItem("theme", themeName)
  }, [])

  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode
    const themeToSet = newMode ? "dark" : "light"
    changeTheme(themeToSet)
  }, [isDarkMode, changeTheme])

  const getWeatherTheme = useCallback(() => {
    const baseClasses = {
      background: "bg-gray-50 dark:bg-gray-900",
      text: "text-gray-900 dark:text-white",
      textSecondary: "text-gray-600 dark:text-gray-400",
      card: "bg-white dark:bg-gray-800",
      cardBackground: "bg-white dark:bg-gray-800",
      border: "border-gray-200 dark:border-gray-700",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      accent: "text-blue-600 dark:text-blue-400",
      gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
      secondary: "bg-gray-100 dark:bg-gray-800",
      primary: "bg-blue-600",
      input: "bg-white dark:bg-gray-700",
    }

    switch (currentTheme) {
      case "sunny":
        return {
          ...baseClasses,
          background: "bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900 dark:to-orange-950",
          text: "text-yellow-900 dark:text-yellow-100",
          textSecondary: "text-yellow-700 dark:text-yellow-300",
          card: "bg-white dark:bg-yellow-900/50",
          cardBackground: "bg-white dark:bg-yellow-900/50",
          border: "border-yellow-200 dark:border-yellow-800",
          button: "bg-orange-500 hover:bg-orange-600 text-white",
          accent: "text-orange-600 dark:text-orange-400",
          gradient: "bg-gradient-to-r from-orange-500 to-yellow-500",
          secondary: "bg-yellow-50 dark:bg-yellow-900/30",
          primary: "bg-orange-500",
          input: "bg-yellow-50 dark:bg-yellow-900/70",
        }
      case "cloudy":
        return {
          ...baseClasses,
          background: "bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900",
          text: "text-gray-800 dark:text-gray-200",
          textSecondary: "text-gray-600 dark:text-gray-400",
          card: "bg-white dark:bg-gray-800",
          cardBackground: "bg-white dark:bg-gray-800",
          border: "border-gray-300 dark:border-gray-600",
          button: "bg-gray-500 hover:bg-gray-600 text-white",
          accent: "text-gray-600 dark:text-gray-400",
          gradient: "bg-gradient-to-r from-gray-500 to-gray-600",
          secondary: "bg-gray-200 dark:bg-gray-700",
          primary: "bg-gray-500",
          input: "bg-gray-100 dark:bg-gray-700",
        }
      case "rainy":
        return {
          ...baseClasses,
          background: "bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-800 dark:to-blue-950",
          text: "text-blue-900 dark:text-blue-100",
          textSecondary: "text-blue-700 dark:text-blue-300",
          card: "bg-white dark:bg-blue-900/50",
          cardBackground: "bg-white dark:bg-blue-900/50",
          border: "border-blue-300 dark:border-blue-700",
          button: "bg-indigo-600 hover:bg-indigo-700 text-white",
          accent: "text-indigo-600 dark:text-indigo-400",
          gradient: "bg-gradient-to-r from-indigo-600 to-blue-600",
          secondary: "bg-blue-100 dark:bg-blue-900/30",
          primary: "bg-indigo-600",
          input: "bg-blue-100 dark:bg-blue-900/70",
        }
      case "snowy":
        return {
          ...baseClasses,
          background: "bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-900 dark:to-blue-950",
          text: "text-blue-900 dark:text-blue-100",
          textSecondary: "text-blue-700 dark:text-blue-300",
          card: "bg-white dark:bg-blue-900/50",
          cardBackground: "bg-white dark:bg-blue-900/50",
          border: "border-blue-200 dark:border-blue-800",
          button: "bg-cyan-500 hover:bg-cyan-600 text-white",
          accent: "text-cyan-600 dark:text-cyan-400",
          gradient: "bg-gradient-to-r from-cyan-500 to-blue-500",
          secondary: "bg-blue-50 dark:bg-blue-900/30",
          primary: "bg-cyan-500",
          input: "bg-blue-50 dark:bg-blue-900/70",
        }
      case "dark":
        return {
          ...baseClasses,
          background: "bg-gray-900",
          text: "text-white",
          textSecondary: "text-gray-400",
          card: "bg-gray-800",
          cardBackground: "bg-gray-800",
          border: "border-gray-700",
          button: "bg-purple-600 hover:bg-purple-700 text-white",
          accent: "text-purple-400",
          gradient: "bg-gradient-to-r from-purple-600 to-indigo-600",
          secondary: "bg-gray-800",
          primary: "bg-purple-600",
          input: "bg-gray-700",
        }
      case "light":
      case "default":
      default:
        return {
          ...baseClasses,
          background: "bg-gradient-to-br from-blue-50 to-indigo-100",
          text: "text-gray-900",
          textSecondary: "text-gray-600",
          card: "bg-white",
          cardBackground: "bg-white",
          border: "border-gray-200",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          accent: "text-blue-600",
          gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
          secondary: "bg-gray-50",
          primary: "bg-blue-600",
          input: "bg-white",
        }
    }
  }, [currentTheme])

  const value = {
    weather,
    setPlace,
    values,
    thisLocation,
    place,
    loading,
    isDarkMode,
    toggleDarkMode,
    getWeatherTheme,
    getThemeClasses: getWeatherTheme,
    fetchWeatherByCity,
    currentTheme,
    changeTheme,
  }

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
}

export const useWeather = () => {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider")
  }
  return context
}

export const useStateContext = useWeather
