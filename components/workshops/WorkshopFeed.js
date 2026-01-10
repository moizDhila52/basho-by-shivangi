'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Users,
  ArrowRight,
  MapPin,
  Filter,
  Calendar,
} from 'lucide-react';

// Categories for Level
const LEVELS = [
  { value: 'All', label: 'All Levels' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Masterclass', label: 'Masterclass' },
];

// Status Filters (Matching Events Page)
const STATUS_FILTERS = [
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Past Workshops' },
];

export default function WorkshopFeed({ initialWorkshops, pastWorkshops }) {
  // Merge both lists into one for easier filtering
  // Add a 'status' property to distinguish them if not present
  const allWorkshops = [
    ...initialWorkshops.map((w) => ({ ...w, displayStatus: 'UPCOMING' })),
    ...pastWorkshops.map((w) => ({ ...w, displayStatus: 'COMPLETED' })),
  ];

  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('UPCOMING');
  const [showFilters, setShowFilters] = useState(false);

  // Filter Logic
  const filtered = allWorkshops.filter((workshop) => {
    const matchesLevel =
      selectedLevel === 'All' || workshop.level === selectedLevel;
    const matchesStatus = workshop.displayStatus === selectedStatus;
    return matchesLevel && matchesStatus;
  });

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header & Filter Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <span className="text-[#8E5022] uppercase tracking-[0.2em] text-xs font-bold mb-2 block">
            Join Us
          </span>
          <h2 className="font-serif text-4xl text-[#442D1C] font-bold">
            {selectedStatus === 'UPCOMING'
              ? 'Upcoming Sessions'
              : 'Workshop Archive'}
          </h2>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium border ${
            showFilters
              ? 'bg-[#442D1C] text-[#EDD8B4] border-[#442D1C]'
              : 'bg-white text-[#442D1C] border-[#EDD8B4] hover:border-[#8E5022]'
          }`}
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Filter Workshops'}
        </button>
      </div>

      {/* Filter Panel (Collapsible) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 bg-white rounded-2xl p-6 border border-[#EDD8B4] shadow-sm overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {/* Level Filter */}
              <div>
                <h3 className="text-xs font-bold text-[#8E5022] uppercase tracking-wider mb-3">
                  Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSelectedLevel(level.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedLevel === level.value
                          ? 'bg-[#442D1C] text-white'
                          : 'bg-[#FDFBF7] text-[#652810] hover:bg-[#EDD8B4]/30'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h3 className="text-xs font-bold text-[#8E5022] uppercase tracking-wider mb-3">
                  Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedStatus(filter.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedStatus === filter.value
                          ? 'bg-[#C85428] text-white'
                          : 'bg-[#FDFBF7] text-[#652810] hover:bg-[#EDD8B4]/30'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((workshop) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={workshop.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#EDD8B4] hover:shadow-2xl hover:shadow-[#C85428]/10 transition-all duration-500 flex flex-col"
              >
                {/* Image Area */}
                <div className="relative h-64 overflow-hidden bg-[#FDFBF7]">
                  <img
                    src={workshop.image || '/placeholder.jpg'}
                    alt={workshop.title}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                      selectedStatus === 'COMPLETED'
                        ? 'grayscale group-hover:grayscale-0'
                        : ''
                    }`}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#442D1C]">
                    {workshop.level}
                  </div>

                  {/* Available Dates Badge (Only for Upcoming) */}
                  {selectedStatus === 'UPCOMING' &&
                    workshop.WorkshopSession?.length > 0 && (
                      <div className="absolute bottom-4 right-4 bg-[#C85428] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {workshop.WorkshopSession.length} Dates Available
                      </div>
                    )}

                  {/* Completed Badge (Only for Past) */}
                  {selectedStatus === 'COMPLETED' && (
                    <div className="absolute bottom-4 right-4 bg-stone-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wide">
                      Concluded
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-2xl text-[#442D1C] group-hover:text-[#C85428] transition-colors leading-tight">
                        {workshop.title}
                      </h3>
                      <p className="text-sm text-[#8E5022] mt-1 font-medium">
                        {workshop.instructorName}
                      </p>
                    </div>
                    {selectedStatus === 'UPCOMING' && (
                      <div className="text-right">
                        <span className="block font-serif text-2xl text-[#442D1C]">
                          ₹{workshop.price}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[#652810]/70 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {workshop.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs text-[#652810]/80 mt-auto mb-6">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#C85428]" />{' '}
                      {workshop.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[#C85428]" /> Max{' '}
                      {workshop.maxStudents}
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin size={14} className="text-[#C85428]" />{' '}
                      {workshop.location}
                    </div>
                  </div>

                  {/* Action Button Changes based on Status */}
                  {selectedStatus === 'UPCOMING' ? (
                    <Link
                      href={`/workshops/${workshop.id}`}
                      className="w-full py-3 rounded-xl border border-[#EDD8B4] text-[#442D1C] font-bold text-sm hover:bg-[#442D1C] hover:text-[#EDD8B4] hover:border-[#442D1C] transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <ArrowRight
                        size={16}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Link>
                  ) : (
                    <div className="w-full py-3 rounded-xl bg-stone-100 text-stone-500 font-bold text-sm text-center cursor-not-allowed border border-stone-200">
                      Registration Closed
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-[#EDD8B4] border-dashed">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FDFBF7] border border-[#EDD8B4] flex items-center justify-center">
                <Calendar className="w-10 h-10 text-[#C85428]" />
              </div>
              <h3 className="font-serif text-2xl text-[#442D1C] mb-2">
                No {selectedStatus.toLowerCase()} workshops found
              </h3>
              <p className="text-[#8E5022] mb-6">
                Try changing your filters or check back later.
              </p>
              <button
                onClick={() => {
                  setSelectedLevel('All');
                  setSelectedStatus('UPCOMING');
                }}
                className="text-[#442D1C] font-medium hover:text-[#C85428] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
