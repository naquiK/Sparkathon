import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react"
import { useWeather } from "../contexts/WeatherContext"

const Footer = () => {
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  return (
    <footer className={`${themeClasses.card} border-t ${themeClasses.border} py-10 mt-12 shadow-inner`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xl font-black ${themeClasses.text} group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}
                >
                  eKart
                </span>
                <span
                  className={`text-xs ${themeClasses.textSecondary} -mt-1 group-hover:text-blue-500 transition-colors`}
                >
                  Shop Together
                </span>
              </div>
            </Link>
            <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}>
              eKart is your ultimate destination for seamless online shopping, offering a wide range of products and
              innovative features like co-shopping and AI assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/surprise-box"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Surprise Box
                </Link>
              </li>
              <li>
                <Link
                  to="/co-shopping"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Co-Shopping
                </Link>
              </li>
              <li>
                <Link
                  to="/chat-rooms"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Chat Rooms
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} text-sm transition-colors`}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info & Social Media */}
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Contact Us</h3>
            <div className="space-y-3">
              <p className={`flex items-center ${themeClasses.textSecondary} text-sm`}>
                <Mail size={16} className="mr-2 text-blue-500" /> support@ekart.com
              </p>
              <p className={`flex items-center ${themeClasses.textSecondary} text-sm`}>
                <Phone size={16} className="mr-2 text-green-500" /> +1 (123) 456-7890
              </p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="#"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} transition-colors`}
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} transition-colors`}
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} transition-colors`}
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className={`${themeClasses.textSecondary} hover:${themeClasses.accent} transition-colors`}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={`border-t ${themeClasses.border} mt-8 pt-8 text-center`}>
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            &copy; {new Date().getFullYear()} eKart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
