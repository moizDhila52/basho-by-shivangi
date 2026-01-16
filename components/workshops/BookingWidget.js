'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Check,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider'; // 👈 ADDED
import { useToast } from '@/components/ToastProvider'; // 👈 ADDED

export default function BookingWidget({ workshopId, price, title, sessions }) {
  const router = useRouter();
  const { user } = useAuth(); // 👈 GET USER
  const { addToast } = useToast(); // 👈 GET TOAST
  const [selectedSession, setSelectedSession] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    async function checkBookings() {
      // Only fetch if user is logged in to avoid 401s or unnecessary calls
      if (!user) return;

      try {
        const res = await fetch('/api/user/workshops');
        if (res.ok) {
          const data = await res.json();
          setUserBookings(data.map((reg) => reg.sessionId));
        }
      } catch (err) {
        console.error('Could not check bookings', err);
      }
    }
    checkBookings();
  }, [user]);

  const isSessionBooked = (sessionId) => userBookings.includes(sessionId);

  const formatSessionDate = (session) => {
    const date = new Date(session.date);
    const time = session.time || '';
    const availableSpots = session.spotsTotal - session.spotsBooked;

    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      time: time,
      availableSpots: availableSpots,
      fullDate: date,
      isFull: session.spotsBooked >= session.spotsTotal,
      isBooked: isSessionBooked(session.id),
    };
  };

  // 👇 UPDATED HANDLE BOOK FUNCTION
  const handleBook = (sessionId) => {
    // 1. Check if user is logged in
    if (!user) {
      addToast('Please sign in to book a workshop', 'error');
      // Redirect to login, then come back to this specific checkout page
      const returnUrl = encodeURIComponent(`/workshops/checkout/${sessionId}`);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    // 2. If logged in, proceed to checkout
    router.push(`/workshops/checkout/${sessionId}`);
  };

  const handleSelectSession = (session) => {
    const formatted = formatSessionDate(session);
    if (!formatted.isBooked && !formatted.isFull) {
      setSelectedSession(session.id);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden">
      {/* Price Header */}
      <div className="p-8 border-b border-stone-100 bg-gradient-to-r from-[#FDFBF7] to-white">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-serif text-[#442D1C]">₹{price}</span>
          <span className="text-stone-500">/ person</span>
        </div>
        <p className="text-sm text-stone-600">
          All materials, firing, and instruction included
        </p>
      </div>

      {/* Session Selection */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="font-serif text-xl text-[#442D1C] mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8E5022]" />
            Select a Session
          </h4>
          <p className="text-sm text-stone-500 mb-4">
            Choose from available dates below
          </p>
        </div>

        <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => {
              const formatted = formatSessionDate(session);
              const isSelected = selectedSession === session.id;

              return (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.0 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    isSelected ? 'z-10' : ''
                  } ${
                    formatted.isBooked || formatted.isFull
                      ? 'cursor-default opacity-80'
                      : ''
                  }`}
                  onClick={() => handleSelectSession(session)}
                >
                  {/* Selected session glowing border effect */}
                  {isSelected && !formatted.isBooked && !formatted.isFull && (
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-[#C85428]/20 to-[#EDD8B4]/20 rounded-2xl blur-sm" />
                  )}

                  <div
                    className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                      isSelected && !formatted.isBooked && !formatted.isFull
                        ? 'border-[#C85428] bg-gradient-to-r from-[#FDFBF7] to-white shadow-lg'
                        : formatted.isBooked
                        ? 'border-green-200 bg-green-50/50'
                        : formatted.isFull
                        ? 'border-stone-200 bg-stone-100/50'
                        : 'border-stone-200 bg-white hover:border-[#EDD8B4] hover:shadow-md'
                    }`}
                  >
                    <div className="p-4 flex items-start gap-4">
                      {/* Date Box */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                          formatted.isBooked
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                            : formatted.isFull
                            ? 'bg-gradient-to-br from-stone-400 to-stone-500 text-white'
                            : isSelected
                            ? 'bg-gradient-to-br from-[#C85428] to-[#8E5022] text-white'
                            : 'bg-gradient-to-br from-stone-100 to-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="text-xs font-bold tracking-wider leading-none">
                          {formatted.month}
                        </div>
                        <div className="text-xl font-bold leading-none mt-0.5">
                          {formatted.day}
                        </div>
                      </div>

                      {/* Date Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5
                              className={`font-serif text-base font-medium mb-0.5 ${
                                formatted.isBooked
                                  ? 'text-green-800'
                                  : formatted.isFull
                                  ? 'text-stone-600'
                                  : isSelected
                                  ? 'text-[#442D1C]'
                                  : 'text-stone-800'
                              }`}
                            >
                              {formatted.weekday}
                            </h5>
                            {isSelected &&
                              !formatted.isBooked &&
                              !formatted.isFull && (
                                <div className="flex items-center gap-1 text-xs text-[#8E5022] font-medium">
                                  <Check className="w-3 h-3" />
                                  <span>Selected</span>
                                </div>
                              )}
                            {formatted.isBooked && (
                              <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                                <CheckCircle className="w-3 h-3" />
                                <span>Booked</span>
                              </div>
                            )}
                            {formatted.isFull && !formatted.isBooked && (
                              <div className="text-xs text-stone-500 font-medium">
                                Sold Out
                              </div>
                            )}
                          </div>

                          {/* Time & Spots */}
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                formatted.isBooked
                                  ? 'text-green-600'
                                  : formatted.isFull
                                  ? 'text-stone-500'
                                  : 'text-stone-600'
                              }`}
                            >
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {formatted.time}
                            </span>
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                formatted.isBooked
                                  ? 'text-green-600'
                                  : formatted.isFull
                                  ? 'text-stone-500'
                                  : 'text-stone-600'
                              }`}
                            >
                              <Users className="w-3 h-3 flex-shrink-0" />
                              {formatted.isFull
                                ? 'No spots'
                                : `${formatted.availableSpots} spots left`}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-3">
                          {formatted.isBooked ? (
                            <Link
                              href="/profile/workshops"
                              className="w-full py-2 rounded-lg font-medium bg-gradient-to-r from-green-500 to-green-600 text-white text-sm shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={14} />
                              View Ticket
                            </Link>
                          ) : formatted.isFull ? (
                            <button
                              disabled
                              className="w-full py-2 rounded-lg font-medium bg-stone-300 text-stone-600 text-sm cursor-not-allowed"
                            >
                              Sold Out
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBook(session.id);
                              }}
                              className={`w-full py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white shadow-md hover:shadow-lg'
                                  : 'bg-gradient-to-r from-stone-100 to-stone-50 text-stone-700 hover:from-stone-200 hover:to-stone-100'
                              }`}
                            >
                              {isSelected ? 'Book Now' : 'Select'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600">No sessions available</p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            if (selectedSession) {
              handleBook(selectedSession);
            }
          }}
          disabled={!selectedSession}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            selectedSession
              ? 'bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white hover:shadow-xl hover:scale-[1.02] active:scale-95'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          {selectedSession
            ? 'Continue to Booking'
            : 'Select a Session to Continue'}
        </button>

        {/* Selected Session Info */}
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-3 bg-gradient-to-r from-[#FDFBF7] to-white rounded-xl border border-[#EDD8B4]/30"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600">Selected session:</span>
              <span className="font-medium text-[#442D1C] text-right">
                {(() => {
                  const session = sessions.find(
                    (s) => s.id === selectedSession,
                  );
                  if (!session) return '';
                  const formatted = formatSessionDate(session);
                  return `${formatted.weekday}, ${formatted.month} ${formatted.day} at ${formatted.time}`;
                })()}
              </span>
            </div>
          </motion.div>
        )}

        {/* Booking Guarantee */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EDD8B4]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#8E5022]" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Free Cancel</p>
                <p className="text-sm font-medium">48h Before</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EDD8B4]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-3 h-3 text-[#8E5022]" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Spots Left</p>
                <p className="text-sm font-medium">
                  {selectedSession
                    ? (() => {
                        const session = sessions.find(
                          (s) => s.id === selectedSession,
                        );
                        return session
                          ? `${session.spotsTotal - session.spotsBooked} left`
                          : 'Select date';
                      })()
                    : 'Select date'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
