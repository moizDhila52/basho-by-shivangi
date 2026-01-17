'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import React from 'react';
import {
  Plus,
  Calendar,
  Users,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  Activity,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import { useNotification } from '@/context/NotificationContext';

export default function AdminWorkshopsPage() {
  const { addToast } = useToast();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger, markAsRead } = useNotification();

  useEffect(() => {
    markAsRead('workshops');
  }, []);

  useEffect(() => {
    if (refreshTrigger.workshops > 0) {
      fetchWorkshops();
    }
  }, [refreshTrigger.workshops]);

  const fetchWorkshops = async () => {
    try {
      const res = await fetch('/api/admin/workshops');
      if (res.ok) setWorkshops(await res.json());
    } catch (error) {
      addToast('Failed to load workshops', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalBookings = 0;
    let activeWorkshops = 0;
    let upcomingSessions = 0;
    const now = new Date();

    workshops.forEach((workshop) => {
      if (workshop.status === 'ACTIVE') activeWorkshops++;
      if (workshop.WorkshopSession) {
        workshop.WorkshopSession.forEach((session) => {
          const booked = session.spotsBooked || 0;
          totalBookings += booked;
          totalRevenue += booked * (workshop.price || 0);
          if (new Date(session.date) >= now) upcomingSessions++;
        });
      }
    });

    return {
      totalRevenue: totalRevenue.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }),
      totalBookings,
      activeWorkshops,
      upcomingSessions,
    };
  }, [workshops]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete the workshop and all sessions.'))
      return;
    try {
      const res = await fetch(`/api/admin/workshops/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWorkshops((prev) => prev.filter((w) => w.id !== id));
        addToast('Workshop deleted', 'success');
      }
    } catch (error) {
      addToast('Failed to delete', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100/90 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-stone-100/90 text-stone-600 border-stone-200';
      default:
        return 'bg-gray-100/90 text-gray-800 border-gray-200';
    }
  };

  if (loading)
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-[#8E5022]">
        Loading schedule...
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C]">
            Workshops
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Manage pottery classes and sessions
          </p>
        </div>
        <Link
          href="/admin/workshops/new"
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-6 py-3 rounded-xl hover:bg-[#652810] transition-all shadow-md font-medium active:scale-95"
        >
          <Plus size={20} /> Schedule Workshop
        </Link>
      </div>

      {/* Stats Cards - Grid adjusted for mobile density */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Revenue"
          value={stats.totalRevenue}
          icon={<IndianRupee className="text-[#C85428]" />}
          color="bg-[#C85428]/10"
        />
        <StatCard
          label="Students"
          value={stats.totalBookings}
          icon={<Users className="text-[#8E5022]" />}
          color="bg-[#8E5022]/10"
        />
        <StatCard
          label="Active"
          value={stats.activeWorkshops}
          icon={<Activity className="text-[#F59E0B]" />}
          color="bg-[#F59E0B]/10"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcomingSessions}
          icon={<Calendar className="text-[#10B981]" />}
          color="bg-[#10B981]/10"
        />
      </div>

      {/* Grid */}
      {workshops.length === 0 ? (
        <div className="text-center p-12 md:p-20 bg-white rounded-2xl border border-[#EDD8B4] border-dashed">
          <Calendar className="w-12 h-12 md:w-16 md:h-16 text-[#EDD8B4] mx-auto mb-4" />
          <h3 className="text-[#442D1C] font-bold text-lg">
            No workshops scheduled
          </h3>
          <p className="text-[#8E5022] mb-6 text-sm">
            Create your first class to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {workshops.map((workshop) => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white rounded-2xl border border-[#EDD8B4] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-48 md:h-56 bg-[#FDFBF7] overflow-hidden">
                <img
                  src={workshop.image || '/placeholder-workshop.jpg'}
                  alt={workshop.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    workshop.status === 'COMPLETED'
                      ? 'grayscale opacity-80'
                      : 'group-hover:scale-105'
                  }`}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md ${getStatusColor(
                      workshop.status
                    )}`}
                  >
                    {workshop.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-[#442D1C] line-clamp-1">
                    {workshop.title}
                  </h3>
                  <span className="font-bold text-[#C85428] whitespace-nowrap">
                    ₹{workshop.price}
                  </span>
                </div>

                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs md:text-sm text-[#8E5022] mb-4 md:mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} /> {workshop.duration}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} /> Max {workshop.maxStudents}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} /> {workshop.location}
                  </div>
                </div>

                {/* Upcoming Sessions Mini-List */}
                <div className="bg-[#FDFBF7] rounded-xl p-3 mb-4 border border-[#EDD8B4]/50 flex-1">
                  <h4 className="text-[10px] font-bold text-[#8E5022] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Upcoming Sessions</span>
                    <span className="bg-[#EDD8B4] text-[#442D1C] px-1.5 py-0.5 rounded text-[10px]">
                      {workshop.WorkshopSession?.filter(
                        (s) => new Date(s.date) >= new Date()
                      ).length || 0}
                    </span>
                  </h4>
                  <div className="space-y-1.5">
                    {workshop.WorkshopSession?.filter(
                      (s) => new Date(s.date) >= new Date()
                    )
                      .slice(0, 2)
                      .map((session) => (
                        <div
                          key={session.id}
                          className="flex justify-between text-xs items-center bg-white p-1.5 rounded border border-[#EDD8B4]/30"
                        >
                          <span className="font-medium text-[#442D1C]">
                            {new Date(session.date).toLocaleDateString(
                              undefined,
                              { day: 'numeric', month: 'short' }
                            )}
                          </span>
                          <span className="text-[#8E5022]/80">
                            {session.time}
                          </span>
                        </div>
                      ))}
                    {(!workshop.WorkshopSession ||
                      workshop.WorkshopSession.filter(
                        (s) => new Date(s.date) >= new Date()
                      ).length === 0) && (
                      <p className="text-xs text-[#8E5022]/50 italic text-center py-1">
                        No upcoming sessions
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[#EDD8B4]/30 mt-auto">
                  <Link
                    href={`/admin/workshops/${workshop.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FDFBF7] hover:bg-[#EDD8B4]/20 border border-[#EDD8B4] text-[#442D1C] py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit2 size={16} /> Manage
                  </Link>
                  <button
                    onClick={() => handleDelete(workshop.id)}
                    className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] md:text-xs font-bold text-[#8E5022] uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-serif font-bold text-[#442D1C] mt-0.5">
          {value}
        </p>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
  );
}