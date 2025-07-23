import React, { useState, useEffect } from "react";

// Helper for localStorage
const STORAGE_KEY = "guideos_trips";
const PAYMENT_KEY = "guideos_payments";
const loadTrips = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveTrips = (trips) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event("storage"));
};
const loadPayments = () => JSON.parse(localStorage.getItem(PAYMENT_KEY) || "[]");

const emptyTrip = {
  id: null,
  date: "",
  client: "",
  location: "",
  gear: "",
  notes: "",
  status: "Upcoming",
};

export default function TripManager() {
  const [trips, setTrips] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState(emptyTrip);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  // Load data on mount
  useEffect(() => {
    setTrips(loadTrips());
    setPayments(loadPayments());
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setTrips(loadTrips());
      setPayments(loadPayments());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save trips on change
  useEffect(() => {
    if (trips.length > 0) {
      saveTrips(trips);
    }
  }, [trips]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Add or update trip
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.client) return;
    if (editingId) {
      setTrips((ts) =>
        ts.map((t) => (t.id === editingId ? { ...form, id: editingId } : t))
      );
    } else {
      setTrips((ts) => [
        ...ts,
        { ...form, id: Date.now().toString() + Math.random().toString(36).slice(2) },
      ]);
    }
    setForm(emptyTrip);
    setEditingId(null);
    setShowForm(false);
  };

  // Edit trip
  const handleEdit = (trip) => {
    setForm(trip);
    setEditingId(trip.id);
    setShowForm(true);
  };

  // Delete trip
  const handleDelete = (id) => {
    if (window.confirm("Delete this trip? Associated payments will remain.")) {
      setTrips((ts) => ts.filter((t) => t.id !== id));
    }
  };

  // Toggle status
  const handleToggleStatus = (id) => {
    setTrips((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Upcoming" ? "Completed" : "Upcoming" }
          : t
      )
    );
  };

  // Get payment info for trip
  const getTripPayment = (tripId) => {
    return payments.find(p => p.tripId === tripId);
  };

  // Sort trips
  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    if (sortBy === "client") return a.client.localeCompare(b.client);
    return 0;
  });

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trip Manager</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="date">Sort by Date</option>
          <option value="client">Sort by Client</option>
        </select>
      </div>

      <button
        className="w-full bg-blue-600 text-white py-3 rounded-lg mb-4 font-medium"
        onClick={() => {
          setForm(emptyTrip);
          setEditingId(null);
          setShowForm(true);
        }}
      >
        + Add New Trip
      </button>

      {showForm && (
        <form
          className="bg-white rounded-lg shadow-sm border p-4 mb-4"
          onSubmit={handleSubmit}
        >
          <h3 className="font-medium mb-3">{editingId ? "Edit Trip" : "Add Trip"}</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
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
                className="w-full border rounded-lg px-3 py-2"
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
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gear Checklist</label>
              <textarea
                name="gear"
                value={form.gear}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                placeholder="Rod, bait, waders, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option>Upcoming</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
              onClick={() => {
                setShowForm(false);
                setForm(emptyTrip);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sortedTrips.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 py-8">
            <div className="text-4xl mb-2">🎣</div>
            <div>No trips yet. Add your first trip!</div>
          </div>
        ) : (
          sortedTrips.map((trip) => {
            const payment = getTripPayment(trip.id);
            return (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-sm border p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{trip.client}</h3>
                    <p className="text-sm text-gray-600">{trip.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      trip.status === "Upcoming"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                    onClick={() => handleToggleStatus(trip.id)}
                    title="Click to toggle status"
                  >
                    {trip.status}
                  </span>
                </div>
                
                {trip.location && (
                  <div className="text-sm text-gray-700 mb-1">
                    📍 {trip.location}
                  </div>
                )}
                
                {trip.gear && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Gear:</span> {trip.gear}
                  </div>
                )}
                
                {trip.notes && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Notes:</span> {trip.notes}
                  </div>
                )}

                {payment && (
                  <div className={`text-sm p-2 rounded mb-2 ${
                    payment.paid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                  }`}>
                    💰 ${Number(payment.amount).toFixed(2)} - {payment.paid ? "Paid" : "Unpaid"}
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  <button
                    className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-sm font-medium"
                    onClick={() => handleEdit(trip)}
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium"
                    onClick={() => handleDelete(trip.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}