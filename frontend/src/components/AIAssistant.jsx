"use client"

import { useState } from "react"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { useWeather } from "../contexts/WeatherContext"

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const { getThemeClasses } = useWeather()
  const themeClasses = getThemeClasses()

  const handleSendMessage = async () => {
    if (input.trim() === "") return

    const userMessage = { sender: "user", text: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Simulate API call to a backend AI service
      const response = await fetch("http://localhost:5000/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI assistant.")
      }

      const data = await response.json()
      const aiMessage = { sender: "ai", text: data.response }
      setMessages((prevMessages) => [...prevMessages, aiMessage])
    } catch (error) {
      console.error("Error communicating with AI assistant:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "ai", text: "Sorry, I'm having trouble connecting right now." },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 p-4 rounded-full ${themeClasses.button} text-white shadow-lg hover:scale-110 transition-transform duration-300 z-50`}
          title="Open AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-80 h-[400px] ${themeClasses.card} border ${themeClasses.border} rounded-xl shadow-2xl flex flex-col z-50 backdrop-blur-lg bg-opacity-90`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${themeClasses.border} ${themeClasses.secondary} rounded-t-xl`}
          >
            <div className="flex items-center space-x-2">
              <Bot className={`${themeClasses.accent}`} size={20} />
              <h3 className={`font-bold ${themeClasses.text}`}>AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-full ${themeClasses.secondary} hover:${themeClasses.cardBackground} transition-colors`}
              title="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">Hi there! How can I help you today?</div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : `${themeClasses.secondary} ${themeClasses.text} rounded-bl-none`
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {msg.sender === "ai" ? (
                      <Bot size={14} className="mr-1 text-blue-400" />
                    ) : (
                      <User size={14} className="mr-1 text-white" />
                    )}
                    <span className="font-semibold text-xs">{msg.sender === "user" ? "You" : "Assistant"}</span>
                  </div>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div
                  className={`${themeClasses.secondary} ${themeClasses.text} max-w-[75%] p-3 rounded-lg rounded-bl-none shadow-sm`}
                >
                  <div className="flex items-center mb-1">
                    <Bot size={14} className="mr-1 text-blue-400" />
                    <span className="font-semibold text-xs">Assistant</span>
                  </div>
                  <p className="text-sm animate-pulse">Typing...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${themeClasses.border} ${themeClasses.secondary} rounded-b-xl`}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className={`flex-1 p-2 rounded-lg border ${themeClasses.border} ${themeClasses.input} ${themeClasses.text} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm`}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                className={`p-2 rounded-lg ${themeClasses.button} text-white hover:opacity-90 transition-opacity`}
                disabled={isTyping || input.trim() === ""}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
