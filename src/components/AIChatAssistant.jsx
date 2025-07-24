import React, { useState, useEffect } from "react";

// Helper for localStorage
const STORAGE_KEY = "guideos_trips";
const PAYMENT_KEY = "guideos_payments";
const loadTrips = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const loadPayments = () => JSON.parse(localStorage.getItem(PAYMENT_KEY) || "[]");

export default function AIChatAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your GuideOS assistant. I can help you with trip planning, gear recommendations, weather info, and more. What can I help you with today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [trips, setTrips] = useState([]);
  const [payments, setPayments] = useState([]);

  // Load data on mount and listen for changes
  useEffect(() => {
    const loadData = () => {
      setTrips(loadTrips());
      setPayments(loadPayments());
    };
    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  // AI Response Logic
  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Trip-related queries
    if (message.includes("trip") || message.includes("schedule")) {
      const upcomingTrips = trips.filter(t => t.status === "Upcoming");
      if (upcomingTrips.length === 0) {
        return "You don't have any upcoming trips scheduled. Would you like to add one?";
      }
      const nextTrip = upcomingTrips.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      return `Your next trip is with ${nextTrip.client} on ${nextTrip.date}${nextTrip.location ? ` at ${nextTrip.location}` : ""}. Need help preparing?`;
    }

    // Payment-related queries
    if (message.includes("payment") || message.includes("money") || message.includes("paid")) {
      const unpaidPayments = payments.filter(p => !p.paid);
      const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      if (unpaidPayments.length === 0) {
        return "Great news! All your payments are up to date. 💰";
      }
      return `You have ${unpaidPayments.length} unpaid payment(s) totaling $${totalUnpaid.toFixed(2)}. The oldest is from ${unpaidPayments[0]?.client || "a client"}.`;
    }

    // Gear recommendations
    if (message.includes("gear") || message.includes("equipment")) {
      return "Here's essential fishing gear I recommend:\n\n🎣 Rod & Reel\n🪝 Hooks (various sizes)\n🎯 Bait/Lures\n🧰 Tackle box\n👕 Weather-appropriate clothing\n🥾 Non-slip boots\n📱 Waterproof phone case\n\nNeed specific recommendations for your trip type?";
    }

    // Weather queries
    if (message.includes("weather")) {
      return "I can't check live weather, but here are some tips:\n\n☀️ Sunny: Early morning/evening are best\n🌧️ Light rain: Fish are often more active\n💨 Windy: Try sheltered areas\n🌡️ Temperature changes: Fish deeper in extreme temps\n\nCheck your local weather app for current conditions!";
    }

    // Location recommendations
    if (message.includes("location") || message.includes("spot") || message.includes("where")) {
      return "Great fishing spots to consider:\n\n🏞️ Lakes: Calm water, good for beginners\n🏔️ Rivers: Moving water, more challenging\n🌊 Coastal: Saltwater species, tidal considerations\n🎣 Ponds: Small, controlled environment\n\nWhat type of fishing experience are you planning?";
    }

    // Client management
    if (message.includes("client")) {
      const recentClients = [...new Set(trips.map(t => t.client))].slice(0, 3);
      if (recentClients.length === 0) {
        return "You haven't added any clients yet. Use the Trip Manager to add your first client!";
      }
      return `Your recent clients include: ${recentClients.join(", ")}. Need help managing client relationships or trip planning?`;
    }

    // General help
    if (message.includes("help")) {
      return "I can help you with:\n\n📅 Trip scheduling & management\n💰 Payment tracking\n🎣 Gear recommendations\n🌤️ Weather considerations\n📍 Location suggestions\n👥 Client management\n\nWhat would you like to know more about?";
    }

    // Default responses
    const defaultResponses = [
      "That's interesting! Can you tell me more about what you're looking for?",
      "I'm here to help with your guiding business. What specific assistance do you need?",
      "Let me help you with that. Are you looking for trip planning, gear advice, or something else?",
      "Great question! I can provide guidance on trips, payments, gear, or general fishing advice. What interests you most?",
      "I'd be happy to help! Could you be more specific about what you need assistance with?",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: generateAIResponse(inputText),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    "Show my upcoming trips",
    "Check unpaid payments",
    "Gear recommendations",
    "Weather tips",
    "Help me plan a trip",
  ];

  return (
    <div className="max-w-md mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <h2 className="text-xl font-bold">GuideOS Assistant</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-line">{message.text}</div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Quick actions:</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                onClick={() => {
                  setInputText(action);
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your guiding business..."
          className="flex-1 border rounded-lg px-3 py-2 resize-none"
          rows={1}
          disabled={isTyping}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isTyping}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}