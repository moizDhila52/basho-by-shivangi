"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Loader2, User, Mail, Check } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";

export default function BookingWidget({ workshopId, price, title, sessions }) {
  const { addToast } = useToast();
  const router = useRouter();

  const [selectedSession, setSelectedSession] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Date, 2: Enter Details
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSession || !formData.name || !formData.email) return;

    setLoading(true);

    try {
      const res = await fetch("/api/workshops/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          customerName: formData.name,
          customerEmail: formData.email,
          amount: price,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Booking failed");

      addToast(`Booking confirmed for ${formData.name}!`, "success");
      setBookingStep(3); // Success View
      router.refresh(); // Refresh page to update slot counts
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS VIEW
  if (bookingStep === 3) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <Check size={32} />
        </div>
        <h3 className="font-serif text-2xl text-[#442D1C] mb-2">You're In!</h3>
        <p className="text-stone-600 mb-6">
          We've sent a confirmation email to {formData.email}.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-[#C85428] font-bold hover:underline"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-[#EDD8B4]">
      {/* Header */}
      <div className="text-center mb-6 border-b border-[#EDD8B4]/30 pb-6">
        <p className="text-[#8E5022] font-medium text-sm uppercase tracking-wide">
          Workshop Fee
        </p>
        <div className="font-serif text-4xl text-[#442D1C] mt-2">
          ₹{price}
          <span className="text-lg text-stone-400 font-sans font-normal">
            /person
          </span>
        </div>
      </div>

      {bookingStep === 1 ? (
        // STEP 1: SELECT DATE
        <>
          <h4 className="font-bold text-[#442D1C] mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#C85428]" /> Select Date
          </h4>
          <div className="space-y-3 mb-8 max-h-60 overflow-y-auto custom-scrollbar">
            {sessions.length === 0 ? (
              <div className="p-4 text-center bg-stone-50 rounded-xl text-stone-500 text-sm">
                No dates available.
              </div>
            ) : (
              sessions.map((session) => {
                const spotsLeft = session.spotsTotal - session.spotsBooked;
                const isFull = spotsLeft <= 0;
                const isSelected = selectedSession?.id === session.id;

                return (
                  <button
                    key={session.id}
                    disabled={isFull}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      isFull
                        ? "border-stone-100 bg-stone-50 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-[#C85428] bg-[#C85428]/5 shadow-inner"
                        : "border-stone-100 hover:border-[#EDD8B4] hover:bg-[#FDFBF7]"
                    }`}
                  >
                    <div className="text-left">
                      <div
                        className={`font-bold text-sm ${
                          isSelected ? "text-[#C85428]" : "text-[#442D1C]"
                        }`}
                      >
                        {format(new Date(session.date), "EEE, MMM dd")}
                      </div>
                      <div className="text-xs text-[#8E5022]">
                        {session.time}
                      </div>
                    </div>
                    <div className="text-right">
                      {isFull ? (
                        <span className="text-xs font-bold text-red-400 uppercase">
                          Sold Out
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            spotsLeft < 5
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {spotsLeft} left
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <button
            onClick={() => setBookingStep(2)}
            disabled={!selectedSession}
            className="w-full py-4 rounded-xl font-bold text-lg bg-[#442D1C] text-[#EDD8B4] hover:bg-[#652810] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </>
      ) : (
        // STEP 2: ENTER DETAILS
        <form onSubmit={handleBook} className="space-y-4">
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EDD8B4]/50 mb-4">
            <p className="text-xs text-[#8E5022] uppercase font-bold">
              Selected Session
            </p>
            <p className="text-[#442D1C] font-medium">
              {format(new Date(selectedSession.date), "MMMM dd, yyyy")} at{" "}
              {selectedSession.time}
            </p>
            <button
              type="button"
              onClick={() => setBookingStep(1)}
              className="text-xs text-[#C85428] underline mt-1"
            >
              Change Date
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-9 p-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-9 p-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg bg-[#442D1C] text-[#EDD8B4] hover:bg-[#652810] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-[#8E5022]/60 mt-4">
        Payment due upon arrival or via link sent to email.
      </p>
    </div>
  );
}
