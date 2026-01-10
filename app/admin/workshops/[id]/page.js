'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  ArrowLeft,
  Download,
  Clock,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminWorkshopDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/workshops/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setWorkshop(data);
        // Auto-expand the first upcoming session
        const firstUpcoming = data.WorkshopSession?.find(
          (s) => new Date(s.date) >= new Date(),
        );
        if (firstUpcoming) setExpandedSession(firstUpcoming.id);
        setLoading(false);
      })
      .catch(() => addToast('Failed to load workshop', 'error'));
  }, [id, addToast]);

  const handleExportCSV = (session) => {
    if (!session.WorkshopRegistration?.length)
      return addToast('No attendees to export', 'error');

    const headers = ['Name', 'Email', 'Status', 'Amount', 'Date'];
    const rows = session.WorkshopRegistration.map((reg) => [
      reg.customerName,
      reg.customerEmail,
      reg.customerPhone || "",
      reg.paymentStatus,
      reg.amountPaid,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${session.date.split('T')[0]}.csv`;
    a.click();
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C85428] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!workshop)
    return <div className="p-10 text-center">Workshop not found</div>;

  // Calculate Stats
  const totalSessions = workshop.WorkshopSession?.length || 0;
  const totalBookings =
    workshop.WorkshopSession?.reduce((acc, s) => acc + s.spotsBooked, 0) || 0;
  const totalRevenue = totalBookings * workshop.price;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header & Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white border border-[#EDD8B4] rounded-xl hover:bg-[#FDFBF7] text-[#8E5022] transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
              {workshop.title}
            </h1>
            <p className="text-[#8E5022] text-sm mt-0.5 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  workshop.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></span>
              {workshop.status} • {workshop.location}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Calendar />}
          label="Total Sessions"
          value={totalSessions}
        />
        <StatCard
          icon={<Users />}
          label="Total Students"
          value={totalBookings}
        />
        <StatCard
          icon={<DollarSign />}
          label="Est. Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#EDD8B4] pb-4">
          <h3 className="font-serif text-xl font-bold text-[#442D1C] flex items-center gap-2">
            Scheduled Sessions
          </h3>
          <span className="text-xs font-medium text-[#8E5022] bg-[#EDD8B4]/20 px-3 py-1 rounded-full">
            {workshop.WorkshopSession?.length} Upcoming
          </span>
        </div>

        <div className="space-y-4">
          {workshop.WorkshopSession?.map((session) => {
            const isExpanded = expandedSession === session.id;
            const occupancy = (session.spotsBooked / session.spotsTotal) * 100;
            const isFull = session.spotsBooked >= session.spotsTotal;

            return (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border transition-all duration-300 rounded-xl overflow-hidden ${
                  isExpanded
                    ? 'border-[#C85428] ring-1 ring-[#C85428]/20 shadow-lg'
                    : 'border-[#EDD8B4] shadow-sm hover:border-[#C85428]/50'
                }`}
              >
                {/* Session Header (Clickable) */}
                <div
                  onClick={() =>
                    setExpandedSession(isExpanded ? null : session.id)
                  }
                  className="p-5 cursor-pointer bg-gradient-to-r from-white to-[#FDFBF7]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#EDD8B4]/20 rounded-xl flex flex-col items-center justify-center text-[#442D1C] border border-[#EDD8B4]">
                        <span className="text-xs font-bold uppercase">
                          {new Date(session.date).toLocaleString('default', {
                            month: 'short',
                          })}
                        </span>
                        <span className="text-xl font-serif font-bold">
                          {new Date(session.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#442D1C] flex items-center gap-2">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                          })}
                          {isFull && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">
                              Full
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-[#8E5022] mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {session.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end min-w-[100px]">
                        <div className="flex justify-between w-full text-xs font-medium mb-1">
                          <span className="text-[#8E5022]">Occupancy</span>
                          <span className="text-[#442D1C]">
                            {session.spotsBooked}/{session.spotsTotal}
                          </span>
                        </div>
                        <div className="w-24 h-2 bg-[#EDD8B4]/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull
                                ? 'bg-red-500'
                                : occupancy > 50
                                ? 'bg-[#C85428]'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-[#C85428]" />
                      ) : (
                        <ChevronDown size={20} className="text-[#EDD8B4]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content (Attendees) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#EDD8B4]"
                    >
                      <div className="p-5 bg-[#FDFBF7]">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-serif font-bold text-[#442D1C] text-sm">
                            Registered Attendees
                          </h5>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportCSV(session);
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-[#C85428] hover:bg-[#C85428]/10 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Download size={14} /> Export List
                          </button>
                        </div>

                        {session.WorkshopRegistration?.length > 0 ? (
                          <div className="bg-white rounded-xl border border-[#EDD8B4] overflow-hidden">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-[#EDD8B4]/10 text-[#8E5022]">
                                <tr>
                                  <th className="px-4 py-3 font-medium">
                                    Name
                                  </th>
                                  <th className="px-4 py-3 font-medium">
                                    Email
                                  </th>
                                  <th className="px-4 py-3 font-medium">
                                    Phone
                                  </th>
                                  <th className="px-4 py-3 font-medium">
                                    Payment
                                  </th>
                                  <th className="px-4 py-3 font-medium text-right">
                                    Registered
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#EDD8B4]/20">
                                {session.WorkshopRegistration.map((reg) => (
                                  <tr
                                    key={reg.id}
                                    className="hover:bg-[#FDFBF7]"
                                  >
                                    <td className="px-4 py-3 font-medium text-[#442D1C]">
                                      {reg.customerName}
                                    </td>

                                    <td className="px-4 py-3 text-stone-600">
                                      {reg.customerEmail}
                                    </td>

                                    {/* DISPLAY PHONE NUMBER */}
                                    <td className="px-4 py-3 text-stone-600 font-mono text-xs">
                                      {reg.customerPhone || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                      {/* DYNAMIC BADGE COLOR */}
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${
                                          reg.paymentStatus === 'PAID'
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : reg.paymentStatus === 'PENDING'
                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            : 'bg-red-50 text-red-700 border-red-100'
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            reg.paymentStatus === 'PAID'
                                              ? 'bg-green-500'
                                              : reg.paymentStatus === 'PENDING'
                                              ? 'bg-yellow-500'
                                              : 'bg-red-500'
                                          }`}
                                        ></span>
                                        {reg.paymentStatus}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-stone-400 text-xs">
                                      {new Date(
                                        reg.createdAt,
                                      ).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-[#EDD8B4] rounded-xl bg-white">
                            <Users className="w-8 h-8 text-[#EDD8B4] mx-auto mb-2" />
                            <p className="text-sm text-stone-500">
                              No registrations yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#EDD8B4] shadow-sm flex items-center gap-4">
      <div className="p-3 bg-[#FDFBF7] rounded-xl text-[#C85428] border border-[#EDD8B4]/50">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-serif font-bold text-[#442D1C] mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
