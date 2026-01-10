'use client';
import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  AlertCircle,
  History,
} from 'lucide-react';

export default function MyWorkshopsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/user/workshops')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((data) => {
        setRegistrations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load workshops. Please try again.');
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="p-20 text-center text-[#8E5022]">
        Loading your schedule...
      </div>
    );

  if (error) {
    return (
      <div className="p-12 text-center border-2 border-red-100 rounded-2xl bg-red-50">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EDD8B4] border-dashed p-12 text-center h-full flex flex-col items-center justify-center">
        <Ticket className="w-12 h-12 text-[#EDD8B4] mb-4" />
        <h3 className="font-serif text-xl text-[#442D1C] mb-2">
          No Workshops Booked
        </h3>
        <p className="text-[#8E5022] mb-6">
          Join us in the studio to learn the art of pottery.
        </p>
        <a
          href="/workshops"
          className="text-[#C85428] font-bold hover:underline"
        >
          Browse Schedule
        </a>
      </div>
    );
  }

  // Logic to separate Upcoming vs Past
  const now = new Date();
  const upcoming = registrations.filter(
    (reg) => new Date(reg.WorkshopSession.date) >= now,
  );
  const past = registrations.filter(
    (reg) => new Date(reg.WorkshopSession.date) < now,
  );

  return (
    <div className="space-y-10">
      {/* UPCOMING SECTION */}
      <section>
        <h2 className="font-serif text-2xl text-[#442D1C] mb-6 flex items-center gap-2">
          <Ticket className="text-[#C85428]" size={24} /> Upcoming Sessions
        </h2>

        {upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((reg) => (
              <div
                key={reg.id}
                className="bg-white p-6 rounded-2xl border border-[#EDD8B4] flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-lg hover:shadow-[#C85428]/5 transition-all"
              >
                {/* Date Badge */}
                <div className="bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-4 text-center min-w-[90px]">
                  <p className="text-xs font-bold text-[#8E5022] uppercase tracking-wider">
                    {new Date(reg.WorkshopSession.date).toLocaleString(
                      'default',
                      { month: 'short' },
                    )}
                  </p>
                  <p className="font-serif text-3xl font-bold text-[#442D1C] leading-none my-1">
                    {new Date(reg.WorkshopSession.date).getDate()}
                  </p>
                  <p className="text-[10px] text-[#8E5022]/60 uppercase">
                    {new Date(reg.WorkshopSession.date).getFullYear()}
                  </p>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Confirmed
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      #{reg.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-1">
                    {reg.WorkshopSession.Workshop.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-[#8E5022] mt-3">
                    <span className="flex items-center gap-1.5 bg-[#FDFBF7] px-2 py-1 rounded-md border border-[#EDD8B4]/30">
                      <Clock size={14} className="text-[#C85428]" />{' '}
                      {reg.WorkshopSession.time}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#FDFBF7] px-2 py-1 rounded-md border border-[#EDD8B4]/30">
                      <MapPin size={14} className="text-[#C85428]" />{' '}
                      {reg.WorkshopSession.Workshop.location}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="w-full md:w-auto">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      reg.WorkshopSession.Workshop.location,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-[#442D1C] text-[#EDD8B4] rounded-xl font-bold text-sm hover:bg-[#2c1d12] transition-colors gap-2"
                  >
                    <MapPin size={16} /> {/* Add icon for visual cue */}
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 italic">
            No upcoming sessions scheduled.
          </p>
        )}
      </section>

      {/* PAST SECTION */}
      {past.length > 0 && (
        <section className="pt-8 border-t border-[#EDD8B4]/30">
          <h2 className="font-serif text-xl text-[#442D1C] mb-6 flex items-center gap-2 opacity-80">
            <History className="text-stone-400" size={24} /> Workshop History
          </h2>
          <div className="grid gap-4 opacity-70 hover:opacity-100 transition-opacity">
            {past.map((reg) => (
              <div
                key={reg.id}
                className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-[#442D1C] text-sm">
                    {reg.WorkshopSession.Workshop.title}
                  </h4>
                  <p className="text-xs text-[#8E5022] mt-0.5">
                    Attended on{' '}
                    {new Date(reg.WorkshopSession.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-medium bg-stone-200 text-stone-600 px-2 py-1 rounded">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
