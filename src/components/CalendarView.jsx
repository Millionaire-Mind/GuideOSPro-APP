import React, { useState, useEffect } from "react";

// Helper for localStorage (same as TripManager)
const STORAGE_KEY = "guideos_trips";
const loadTrips = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const emptyTrip = {
  id: null,
  date: "",
  client: "",
  location: "",
  gear: "",
  notes: "",
  status: "Upcoming",
};

export default function CalendarView() {
  const [trips, setTrips] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyTrip);
  const [editingId, setEditingId] = useState(null);

  // Load trips on mount and listen for changes
  useEffect(() => {
    const loadData = () => setTrips(loadTrips());
    loadData();
    
    // Listen for storage changes (when TripManager updates)
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  // Save trips to localStorage
  const saveTrips = (newTrips) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrips));
    setTrips(newTrips);
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
  };

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate calendar days
  const calendarDays = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Get trips for a specific date
  const getTripsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return trips.filter(trip => trip.date === dateStr);
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateTrips = getTripsForDate(date);
    if (dateTrips.length === 0) {
      // No trips, show add form
      setForm({
        ...emptyTrip,
        date: date.toISOString().split('T')[0]
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Add or update trip
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.client) return;
    
    let newTrips;
    if (editingId) {
      newTrips = trips.map((t) => (t.id === editingId ? { ...form, id: editingId } : t));
    } else {
      newTrips = [
        ...trips,
        { ...form, id: Date.now().toString() + Math.random().toString(36).slice(2) },
      ];
    }
    
    saveTrips(newTrips);
    setForm(emptyTrip);
    setEditingId(null);
    setShowModal(false);
  };

  // Edit trip
  const handleEdit = (trip) => {
    setForm(trip);
    setEditingId(trip.id);
  };

  // Delete trip
  const handleDelete = (id) => {
    if (window.confirm("Delete this trip?")) {
      const newTrips = trips.filter((t) => t.id !== id);
      saveTrips(newTrips);
    }
  };

  // Toggle status
  const handleToggleStatus = (id) => {
    const newTrips = trips.map((t) =>
      t.id === id
        ? { ...t, status: t.status === "Upcoming" ? "Completed" : "Upcoming" }
        : t
    );
    saveTrips(newTrips);
  };

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === month;
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:underline"
          >
            Today
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayTrips = getTripsForDate(date);
            const hasTrips = dayTrips.length > 0;
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`
                  p-2 min-h-[60px] border-b border-r cursor-pointer hover:bg-gray-50 transition-colors
                  ${!isCurrentMonthDay ? "text-gray-300 bg-gray-50" : ""}
                  ${isTodayDate ? "bg-blue-50 font-bold" : ""}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className="text-sm mb-1">{date.getDate()}</div>
                {hasTrips && (
                  <div className="space-y-1">
                    {dayTrips.slice(0, 2).map((trip, i) => (
                      <div
                        key={i}
                        className={`
                          text-xs px-1 py-0.5 rounded truncate
                          ${trip.status === "Upcoming" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-green-100 text-green-700"
                          }
                        `}
                      >
                        {trip.client}
                      </div>
                    ))}
                    {dayTrips.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayTrips.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  {selectedDate.toLocaleDateString()}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Existing trips */}
              {getTripsForDate(selectedDate).map((trip) => (
                <div key={trip.id} className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{trip.client}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                        trip.status === "Upcoming"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                      onClick={() => handleToggleStatus(trip.id)}
                    >
                      {trip.status}
                    </span>
                  </div>
                  {trip.location && (
                    <div className="text-sm text-gray-600 mb-1">📍 {trip.location}</div>
                  )}
                  {trip.gear && (
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">Gear:</span> {trip.gear}
                    </div>
                  )}
                  {trip.notes && (
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-semibold">Notes:</span> {trip.notes}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-yellow-100 text-yellow-800 py-1 rounded text-xs"
                      onClick={() => handleEdit(trip)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 bg-red-100 text-red-800 py-1 rounded text-xs"
                      onClick={() => handleDelete(trip.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Add/Edit form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name</label>
                  <input
                    type="text"
                    name="client"
                    value={form.client}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gear Checklist</label>
                  <textarea
                    name="gear"
                    value={form.gear}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Rod, bait, waders, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option>Upcoming</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    {editingId ? "Update Trip" : "Add Trip"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg text-sm font-medium"
                    onClick={() => {
                      setForm(emptyTrip);
                      setEditingId(null);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}