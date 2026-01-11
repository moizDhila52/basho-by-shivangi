'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  Users,
  Clock,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';

export default function AdminWorkshopsPage() {
  const { addToast } = useToast();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (
      !confirm('Are you sure? This will delete the workshop and all sessions.')
    )
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
        return 'bg-green-100/90 text-green-800';
      case 'COMPLETED':
        return 'bg-stone-100/90 text-stone-600';
      default:
        return 'bg-gray-100/90 text-gray-800';
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-[#8E5022]">Loading schedule...</div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
            Workshops
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Manage pottery classes and sessions
          </p>
        </div>
        <Link
          href="/admin/workshops/new"
          className="flex items-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-6 py-3 rounded-xl hover:bg-[#652810] transition-all shadow-lg font-medium"
        >
          <Plus size={20} /> Schedule Workshop
        </Link>
      </div>

      {/* Grid */}
      {workshops.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-2xl border border-[#EDD8B4] border-dashed">
          <Calendar className="w-16 h-16 text-[#EDD8B4] mx-auto mb-4" />
          <h3 className="text-[#442D1C] font-bold text-lg">
            No workshops scheduled
          </h3>
          <p className="text-[#8E5022] mb-6">
            Create your first class to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white rounded-2xl border border-[#EDD8B4] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-48 bg-[#FDFBF7] overflow-hidden">
                <img
                  src={workshop.image || '/placeholder-workshop.jpg'}
                  alt={workshop.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    workshop.status === 'COMPLETED'
                      ? 'grayscale opacity-80'
                      : 'group-hover:scale-105'
                  }`}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${getStatusColor(
                      workshop.status,
                    )}`}
                  >
                    {workshop.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-xl font-bold text-[#442D1C] line-clamp-1">
                    {workshop.title}
                  </h3>
                  <span className="font-bold text-[#C85428]">
                    ₹{workshop.price}
                  </span>
                </div>

                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-[#8E5022] mb-6">
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

                {/* Sessions Preview */}
                <div className="bg-[#FDFBF7] rounded-xl p-4 mb-6 border border-[#EDD8B4]/50 flex-1">
                  <h4 className="text-[10px] font-bold text-[#8E5022] uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Upcoming Sessions</span>
                    <span className="bg-[#EDD8B4] text-[#442D1C] px-1.5 py-0.5 rounded text-[10px]">
                      {workshop.WorkshopSession?.filter(
                        (s) => new Date(s.date) >= new Date(),
                      ).length || 0}
                    </span>
                  </h4>
                  <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
                    {workshop.WorkshopSession?.length > 0 ? (
                      workshop.WorkshopSession.filter(
                        (s) => new Date(s.date) >= new Date(),
                      )
                        .slice(0, 3)
                        .map((session) => (
                          <div
                            key={session.id}
                            className="flex justify-between text-sm items-center"
                          >
                            <span className="font-medium text-[#442D1C]">
                              {new Date(session.date).toLocaleDateString(
                                undefined,
                                { day: 'numeric', month: 'short' },
                              )}
                            </span>
                            <span className="text-[#8E5022]/80 text-xs bg-white px-2 py-0.5 rounded border border-[#EDD8B4]/50">
                              {session.time}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-[#8E5022]/50 italic">
                        All sessions completed
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-[#EDD8B4]/30 mt-auto">
                  <Link
                    href={`/admin/workshops/${workshop.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FDFBF7] hover:bg-[#EDD8B4]/20 border border-[#EDD8B4] text-[#442D1C] py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit2 size={16} /> Details
                  </Link>
                  <button
                    onClick={() => handleDelete(workshop.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg transition-colors"
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
