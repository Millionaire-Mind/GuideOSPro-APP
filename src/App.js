import React, { useState } from "react";
import TripManager from "./components/TripManager";
import CalendarView from "./components/CalendarView";
import PaymentTracker from "./components/PaymentTracker";
import AIChatAssistant from "./components/AIChatAssistant";

const TABS = [
  { key: "trips", label: "Trips", icon: "📋" },
  { key: "calendar", label: "Calendar", icon: "📅" },
  { key: "payments", label: "Payments", icon: "💰" },
  { key: "ai", label: "AI", icon: "🤖" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("trips");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-xl font-bold">GuideOS</h1>
        <p className="text-sm opacity-90">Your Outdoor Guide Assistant</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-around bg-white shadow-sm border-b sticky top-0 z-10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 py-3 px-2 text-center transition-colors ${
              activeTab === tab.key
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <div className="text-lg">{tab.icon}</div>
            <div className="text-xs font-medium">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "trips" && <TripManager />}
        {activeTab === "calendar" && <CalendarView />}
        {activeTab === "payments" && <PaymentTracker />}
        {activeTab === "ai" && <AIChatAssistant />}
      </div>
    </div>
  );
}