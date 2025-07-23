import React, { useState } from "react";

const initialMessages = [
  { from: "ai", text: "🎣 Plan my next trip! What location are you thinking about?" }
];

export default function AIChatAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ location: "", gear: "", clientType: "" });

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let newMessages = [...messages, { from: "user", text: input }];
    let nextStep = step + 1;
    let newAnswers = { ...answers };

    if (step === 0) {
      newAnswers.location = input;
      newMessages.push({ from: "ai", text: "Great choice! What gear will you need for this trip?" });
    } else if (step === 1) {
      newAnswers.gear = input;
      newMessages.push({ from: "ai", text: "Perfect! What type of client is this trip for? (beginner, experienced, family, etc.)" });
    } else if (step === 2) {
      newAnswers.clientType = input;
      // Generate summary
      const summary = generateTripSummary(newAnswers);
      newMessages.push({ from: "ai", text: summary });
      newMessages.push({ from: "ai", text: "__CREATE_TRIP_BUTTON__" }); // special marker
    }

    setMessages(newMessages);
    setInput("");
    setStep(nextStep);
    setAnswers(newAnswers);
  };

  const generateTripSummary = (answers) => {
    return `**🎯 Trip Prep Summary**

**📍 Location:** ${answers.location}
**🎒 Gear Needed:** ${answers.gear}
**👥 Client Type:** ${answers.clientType}

**⏰ Pre-Trip Checklist:**
• Check weather conditions for ${answers.location}
• Prepare gear: ${answers.gear}
• Review safety protocols for ${answers.clientType} clients
• Confirm meeting time and location
• Check licenses and permits
• Pack first aid kit and emergency contacts

**💡 Pro Tips:**
• Arrive 30 minutes early to set up
• Bring backup gear for ${answers.clientType} clients
• Check local regulations for ${answers.location}
• Have a backup plan for weather changes

**📱 Don't Forget:**
• Charge phone and GPS devices
• Bring cash for tips/emergencies
• Update client on any last-minute changes

Have an amazing trip! 🌟`;
  };

  const handleCreateTrip = () => {
    // Save trip to localStorage
    const trips = JSON.parse(localStorage.getItem("guideos_trips") || "[]");
    const newTrip = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      date: "", // let user fill in later
      client: `${answers.clientType} client`,
      location: answers.location,
      gear: answers.gear,
      notes: `AI-generated trip for ${answers.clientType} client`,
      status: "Upcoming",
    };
    localStorage.setItem("guideos_trips", JSON.stringify([...trips, newTrip]));
    window.dispatchEvent(new Event("storage"));
    
    setMessages(prev => [
      ...prev.filter(msg => msg.text !== "__CREATE_TRIP_BUTTON__"),
      { from: "ai", text: "✅ Trip draft created! You can find it in the Trip Manager to add date and client details." }
    ]);
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setStep(0);
    setAnswers({ location: "", gear: "", clientType: "" });
    setInput("");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">AI Trip Planner</h2>
        {step > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:underline"
          >
            Start Over
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4 h-96 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.text === "__CREATE_TRIP_BUTTON__" ? (
                <div className="text-center">
                  <button
                    onClick={handleCreateTrip}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    📋 Create Trip Draft
                  </button>
                </div>
              ) : (
                <div
                  className={`flex ${
                    msg.from === "ai" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.from === "ai"
                        ? "bg-blue-50 text-blue-900"
                        : "bg-green-50 text-green-900"
                    }`}
                  >
                    {msg.text.startsWith("**🎯 Trip Prep Summary**") ? (
                      <div 
                        className="whitespace-pre-line text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: msg.text
                            .replace(/\n/g, "<br/>")
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/•/g, "•")
                        }} 
                      />
                    ) : (
                      <div className="text-sm">{msg.text}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {step < 3 && (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-4 py-3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              step === 0 ? "e.g., Lake Tahoe" :
              step === 1 ? "e.g., rods, bait, waders" :
              "e.g., beginner, family group"
            }
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </form>
      )}

      {step >= 3 && (
        <div className="text-center">
          <button
            onClick={handleReset}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Plan Another Trip
          </button>
        </div>
      )}
    </div>
  );
}