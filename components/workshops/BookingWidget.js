'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, CheckCircle, Loader2 } from 'lucide-react';

export default function BookingWidget({ workshopId, price, title, sessions }) {
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState(null);

  // --- LOGIC: Fetch User Bookings to Prevent Double Booking ---
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    async function checkBookings() {
      try {
        const res = await fetch('/api/user/workshops');
        if (res.ok) {
          const data = await res.json();
          // Store just the session IDs for easy checking
          setUserBookings(data.map((reg) => reg.sessionId));
        }
      } catch (err) {
        console.error('Could not check bookings', err);
      }
    }
    checkBookings();
  }, []);

  // Helper Function to Check Status
  const isSessionBooked = (sessionId) => userBookings.includes(sessionId);
  // ------------------------------------------------------------

  const handleBook = (sessionId) => {
    // Redirect to the dedicated checkout page
    router.push(`/workshops/checkout/${sessionId}`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
      <h3 className="font-serif text-xl text-[#442D1C] mb-1">{title}</h3>
      <p className="text-[#C85428] font-bold text-lg mb-6">
        ₹{price}
        <span className="text-sm font-normal text-[#8E5022]">/person</span>
      </p>

      <h4 className="text-xs font-bold text-[#8E5022] uppercase mb-3">
        Select a Session
      </h4>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {sessions.map((session) => {
          const isFull = session.spotsBooked >= session.spotsTotal;
          const isBooked = isSessionBooked(session.id); // Check if user already booked

          return (
            <div
              key={session.id}
              className={`p-3 rounded-xl border transition-all ${
                selectedSession === session.id
                  ? 'border-[#C85428] bg-[#FDFBF7] ring-1 ring-[#C85428]'
                  : 'border-[#EDD8B4]/50 hover:border-[#C85428]/50'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg border border-[#EDD8B4]/50 text-center min-w-[50px]">
                    <p className="text-[10px] font-bold text-[#8E5022] uppercase">
                      {new Date(session.date).toLocaleString('default', {
                        month: 'short',
                      })}
                    </p>
                    <p className="font-serif text-lg font-bold text-[#442D1C] leading-none">
                      {new Date(session.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#442D1C] font-medium text-sm">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                      })}
                    </p>
                    <p className="text-[#8E5022] text-xs">{session.time}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="session"
                  disabled={isFull || isBooked}
                  onChange={() => setSelectedSession(session.id)}
                  checked={selectedSession === session.id}
                  className="accent-[#C85428] w-4 h-4"
                />
              </div>

              {/* Dynamic Button Logic */}
              {isBooked ? (
                <Link
                  href="/profile/workshops"
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} /> You're Going! (View Ticket)
                </Link>
              ) : (
                <button
                  onClick={() => handleBook(session.id)}
                  disabled={isFull}
                  className="w-full bg-[#442D1C] text-[#EDD8B4] py-2 rounded-lg font-bold text-sm hover:bg-[#2c1d12] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isFull ? 'Sold Out' : 'Book Spot'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <div className="text-center p-4 bg-[#FDFBF7] rounded-xl border border-dashed border-[#EDD8B4]">
          <Calendar className="w-6 h-6 text-[#EDD8B4] mx-auto mb-2" />
          <p className="text-sm text-[#8E5022]">No upcoming sessions.</p>
        </div>
      )}
    </div>
  );
}
