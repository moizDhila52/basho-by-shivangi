'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ArrowRight, MapPin, Archive } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Masterclass',
];

export default function WorkshopFeed({ initialWorkshops, pastWorkshops }) {
  const [filter, setFilter] = useState('All');

  const filtered =
    filter === 'All'
      ? initialWorkshops
      : initialWorkshops.filter((w) => w.level === filter);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Filter Tabs */}
      <div className="flex justify-center mb-16">
        <div className="inline-flex flex-wrap gap-2 p-1.5 bg-white rounded-full border border-[#EDD8B4] shadow-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === cat
                  ? 'bg-[#442D1C] text-[#EDD8B4] shadow-md'
                  : 'text-[#8E5022] hover:bg-[#FDFBF7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
      >
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((workshop) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={workshop.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#EDD8B4] hover:shadow-2xl hover:shadow-[#C85428]/10 transition-all duration-500 flex flex-col"
              >
                {/* Image Area */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={workshop.image || '/placeholder.jpg'}
                    alt={workshop.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#442D1C]">
                    {workshop.level}
                  </div>
                  {workshop.WorkshopSession?.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-[#C85428] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {workshop.WorkshopSession.length} Dates Available
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
                    <div className="text-right">
                      <span className="block font-serif text-2xl text-[#442D1C]">
                        ₹{workshop.price}
                      </span>
                    </div>
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
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 opacity-50">
              <p className="text-xl font-serif text-[#442D1C]">
                No upcoming workshops found for this category.
              </p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* PAST EDITIONS SECTION */}
      {pastWorkshops && pastWorkshops.length > 0 && (
        <div className="border-t border-[#EDD8B4] pt-16">
          <h3 className="font-serif text-3xl text-[#442D1C] mb-8 text-center flex items-center justify-center gap-3">
            <Archive className="text-[#EDD8B4]" /> Past Editions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {pastWorkshops.map((workshop) => (
              <div
                key={workshop.id}
                className="bg-[#FDFBF7] rounded-2xl p-4 border border-[#EDD8B4]/50 flex gap-4 items-center"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200">
                  <img
                    src={workshop.image}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-[#442D1C] line-clamp-1">
                    {workshop.title}
                  </h4>
                  <p className="text-xs text-[#8E5022] mt-1">Concluded</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
