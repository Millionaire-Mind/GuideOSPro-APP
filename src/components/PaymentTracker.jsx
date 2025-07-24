import React, { useState, useEffect } from "react";

// Helpers for localStorage
const PAYMENT_KEY = "guideos_payments";
const TRIP_KEY = "guideos_trips";
const loadPayments = () => JSON.parse(localStorage.getItem(PAYMENT_KEY) || "[]");
const savePayments = (payments) => {
  localStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
  window.dispatchEvent(new Event("storage"));
};
const loadTrips = () => JSON.parse(localStorage.getItem(TRIP_KEY) || "[]");

const emptyPayment = {
  id: null,
  client: "",
  tripId: "",
  amount: "",
  paid: false,
  method: "Cash",
};

export default function PaymentTracker() {
  const [payments, setPayments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(emptyPayment);
  const [editingId, setEditingId] = useState(null);
  const [filterUnpaid, setFilterUnpaid] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setPayments(loadPayments());
    setTrips(loadTrips());
    // Listen for trip changes
    const syncData = () => {
      setTrips(loadTrips());
      setPayments(loadPayments());
    };
    window.addEventListener("storage", syncData);
    return () => window.removeEventListener("storage", syncData);
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      savePayments(payments);
    }
  }, [payments]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.client || !form.amount) return;
    if (editingId) {
      setPayments((ps) =>
        ps.map((p) => (p.id === editingId ? { ...form, id: editingId } : p))
      );
    } else {
      setPayments((ps) => [
        ...ps,
        { ...form, id: Date.now().toString() + Math.random().toString(36).slice(2) },
      ]);
    }
    setForm(emptyPayment);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (payment) => {
    setForm(payment);
    setEditingId(payment.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this payment?")) {
      setPayments((ps) => ps.filter((p) => p.id !== id));
    }
  };

  const filteredPayments = filterUnpaid
    ? payments.filter((p) => !p.paid)
    : payments;

  // Sort unpaid first, then by most recent
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (a.paid === b.paid) {
      return b.id.localeCompare(a.id);
    }
    return a.paid ? 1 : -1;
  });

  // Calculate totals
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paidAmount = payments.filter(p => p.paid).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Payment Tracker</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          onClick={() => {
            setForm(emptyPayment);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Add
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-xs text-blue-600 font-medium">Total</div>
          <div className="text-lg font-bold text-blue-700">${totalAmount.toFixed(2)}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-xs text-green-600 font-medium">Paid</div>
          <div className="text-lg font-bold text-green-700">${paidAmount.toFixed(2)}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-xs text-yellow-600 font-medium">Unpaid</div>
          <div className="text-lg font-bold text-yellow-700">${unpaidAmount.toFixed(2)}</div>
        </div>
      </div>

      {showForm && (
        <form
          className="bg-white rounded-lg shadow-sm border p-4 mb-4"
          onSubmit={handleSubmit}
        >
          <h3 className="font-medium mb-3">{editingId ? "Edit Payment" : "Add Payment"}</h3>
          <div className="space-y-3">
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
              <label className="block text-sm font-medium mb-1">Link to Trip (optional)</label>
              <select
                name="tripId"
                value={form.tripId}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">-- No Trip --</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.client} - {trip.date} ({trip.location || "No location"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="paid"
                checked={form.paid}
                onChange={handleChange}
                className="mr-2"
                id="paid"
              />
              <label htmlFor="paid" className="text-sm font-medium">
                Payment Received
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option>Cash</option>
                <option>Stripe</option>
                <option>Check</option>
                <option>Venmo</option>
                <option>Other</option>
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
                setForm(emptyPayment);
                setEditingId(null);
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={filterUnpaid}
          onChange={() => setFilterUnpaid((f) => !f)}
          id="filterUnpaid"
          className="mr-2"
        />
        <label htmlFor="filterUnpaid" className="text-sm font-medium">
          Show only unpaid ({payments.filter(p => !p.paid).length})
        </label>
      </div>

      <div className="space-y-3">
        {sortedPayments.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 py-8">
            <div className="text-4xl mb-2">💰</div>
            <div>{filterUnpaid ? "No unpaid payments!" : "No payments yet."}</div>
          </div>
        ) : (
          sortedPayments.map((payment) => {
            const linkedTrip = payment.tripId ? trips.find(t => t.id === payment.tripId) : null;
            return (
              <div
                key={payment.id}
                className="bg-white rounded-lg shadow-sm border p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{payment.client}</h3>
                    {linkedTrip && (
                      <p className="text-sm text-blue-600">
                        🔗 {linkedTrip.date} - {linkedTrip.location || "No location"}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.paid
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
                
                <div className="text-xl font-bold text-gray-900 mb-1">
                  ${Number(payment.amount).toFixed(2)}
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  Method: {payment.method}
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-sm font-medium"
                    onClick={() => handleEdit(payment)}
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium"
                    onClick={() => handleDelete(payment.id)}
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