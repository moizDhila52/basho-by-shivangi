"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  ArrowRight,
  MapPin,
  Filter,
  Sparkles,
  Calendar,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const LEVELS = [
  { value: "All", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const STATUS_FILTERS = [
  { value: "UPCOMING", label: "Upcoming Sessions" },
  { value: "COMPLETED", label: "Archive" },
];

export default function WorkshopFeed({ initialWorkshops, pastWorkshops }) {
  // Merge data
  const allWorkshops = [
    ...initialWorkshops.map((w) => ({ ...w, displayStatus: "UPCOMING" })),
    ...pastWorkshops.map((w) => ({ ...w, displayStatus: "COMPLETED" })),
  ];

  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("UPCOMING");
  const [showFilters, setShowFilters] = useState(false);

  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blobs, setBlobs] = useState([]);

  useEffect(() => {
    // Generate random values only once on the client side
    const newBlobs = [...Array(8)].map(() => ({
      width: Math.random() * 200 + 50 + "px",
      height: Math.random() * 200 + 50 + "px",
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      opacity: Math.random() * 0.2 + 0.1,
    }));
    setBlobs(newBlobs);
  }, []);

  // Filter Logic
  useEffect(() => {
    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      const results = allWorkshops.filter((workshop) => {
        const matchesLevel =
          selectedLevel === "All" || workshop.level === selectedLevel;
        const matchesStatus = workshop.displayStatus === selectedStatus;
        return matchesLevel && matchesStatus;
      });
      setFilteredWorkshops(results);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [selectedLevel, selectedStatus]);

  const clearFilters = () => {
    setSelectedLevel("All");
  };

  return (
    <div className="font-sans text-stone-800">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          {blobs.map((style, i) => (
  <div
    key={i}
    className="absolute rounded-full bg-[#8E5022]"
    style={style}
  />
))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> The Studio Sessions
              </span>
              <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
                Connect with <br />
                <span className="text-[#C85428]">Clay & Earth</span>
              </h1>
              <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                Immerse yourself in the tactile art of ceramics. Our workshops
                are designed to slow down time and reconnect your hands with the
                material.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 pt-8">
            <div className="flex-1 overflow-x-auto pt-2 pb-4">
              <div className="flex gap-2">
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedStatus === status.value
                        ? "bg-[#442D1C] text-white shadow-md"
                        : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border-2 border-stone-200 rounded-xl px-6 py-3 hover:border-[#8E5022] transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {selectedLevel !== "All" && (
                  <span className="bg-[#C85428] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-2xl text-[#442D1C]">
                      Filter by Level
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-stone-500 hover:text-[#C85428] transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {LEVELS.map((level) => (
                      <label
                        key={level.value}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLevel === level.value}
                          onChange={() => setSelectedLevel(level.value)}
                          className="hidden"
                        />
                        <div
                          className={`px-5 py-3 rounded-xl border-2 transition-all font-medium ${
                            selectedLevel === level.value
                              ? "bg-[#8E5022] border-[#8E5022] text-white"
                              : "border-stone-200 text-stone-600 hover:border-[#8E5022]"
                          }`}
                        >
                          {level.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count & Loader */}
          <div className="mb-8 h-6 flex items-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-stone-500 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating schedule...</span>
              </div>
            ) : (
              <p className="text-stone-600">
                Showing{" "}
                <span className="font-medium text-[#442D1C]">
                  {filteredWorkshops.length}
                </span>{" "}
                {selectedStatus === "UPCOMING" ? "upcoming" : "past"} workshops
                {selectedLevel !== "All" && ` for ${selectedLevel}s`}
              </p>
            )}
          </div>

          {/* GRID CONTENT */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-100"
                >
                  <div className="h-72 bg-stone-200 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-stone-200 rounded w-1/4 animate-pulse" />
                    <div className="h-8 bg-stone-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-stone-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-stone-200 rounded w-2/3 animate-pulse" />
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="h-4 bg-stone-200 rounded animate-pulse" />
                      <div className="h-4 bg-stone-200 rounded animate-pulse" />
                    </div>
                    <div className="h-12 bg-stone-200 rounded-xl mt-6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredWorkshops.length > 0 ? (
                filteredWorkshops.map((workshop) => (
                  <WorkshopCard
                    key={workshop.id}
                    workshop={workshop}
                    isPast={selectedStatus === "COMPLETED"}
                  />
                ))
              ) : (
                <motion.div
                  variants={fadeInUp}
                  className="col-span-full text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-stone-400" />
                  </div>
                  <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                    No workshops found
                  </h3>
                  <p className="text-stone-600 mb-8 max-w-md mx-auto">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

// --- SUB-COMPONENT: WORKSHOP CARD ---
function WorkshopCard({ workshop, isPast }) {
  const datesAvailable = workshop.WorkshopSession?.length || 0;

  return (
    <motion.div
      variants={fadeInUp}
      // Only lift if NOT past
      whileHover={!isPast ? { y: -8 } : {}}
      className={`group relative bg-white rounded-3xl overflow-hidden flex flex-col h-full ${
        isPast
          ? "opacity-60 grayscale border border-stone-200" // Static, grey, no shadow for Archive
          : "shadow-lg hover:shadow-2xl transition-all duration-300" // Interactive for Upcoming
      }`}
    >
      {/* Badges (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-[#442D1C] shadow-sm">
          {workshop.level}
        </span>
      </div>

      {/* Status Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        {isPast ? (
          <span className="bg-stone-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            Concluded
          </span>
        ) : datesAvailable > 0 ? (
          <span className="bg-[#442D1C] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Calendar className="w-3 h-3" />
            {datesAvailable} Dates
          </span>
        ) : (
          <span className="bg-[#C85428] text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            Sold Out
          </span>
        )}
      </div>

      {/* Image Area */}
      <Link
        href={!isPast ? `/workshops/${workshop.id}` : "#"}
        // FIXED: Added 'block w-full' so the anchor tag doesn't collapse or behave as inline
        className={`block w-full ${isPast ? "cursor-default" : ""}`}
      >
        <div className="relative h-72 w-full overflow-hidden bg-stone-100">
          {workshop.image ? (
            <img
              src={workshop.image}
              alt={workshop.title}
              // FIXED: Unconditional 'object-cover' and 'object-center' ensures fit for both Archive and Upcoming
              className={`w-full h-full object-cover object-center ${
                !isPast
                  ? "transition-transform duration-700 group-hover:scale-110"
                  : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-200">
              <div className="w-16 h-16 rounded-full bg-stone-300 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-stone-500" />
              </div>
            </div>
          )}

          {/* Gradient Overlay - Upcoming Only */}
          {!isPast && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <Link
          href={!isPast ? `/workshops/${workshop.id}` : "#"}
          // FIXED: Added 'block' here as well for safety
          className={`block ${isPast ? "cursor-default" : ""}`}
        >
          <div className={!isPast ? "cursor-pointer" : "cursor-default"}>
            <span className="text-xs text-[#8E5022] font-bold uppercase tracking-wider block mb-1">
              {workshop.instructorName}
            </span>
            <h3
              className={`font-serif text-2xl text-[#442D1C] mb-3 leading-tight ${
                !isPast ? "group-hover:text-[#C85428] transition-colors" : ""
              }`}
            >
              {workshop.title}
            </h3>
          </div>
        </Link>

        <p className="text-stone-600 text-sm mb-6 line-clamp-2 flex-1">
          {workshop.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-stone-50 p-2 rounded-lg">
            <Clock size={14} className="text-[#C85428]" />
            <span>{workshop.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-stone-50 p-2 rounded-lg">
            <Users size={14} className="text-[#C85428]" />
            <span>Max {workshop.maxStudents}</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-xs font-medium text-stone-600 bg-stone-50 p-2 rounded-lg">
            <MapPin size={14} className="text-[#C85428]" />
            <span className="truncate">{workshop.location}</span>
          </div>
        </div>

        {/* Action Button */}
        {!isPast ? (
          <Link href={`/workshops/${workshop.id}`}>
            <button className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-[#8E5022] text-white hover:bg-[#652810] shadow-md hover:shadow-lg transform active:scale-95">
              View Details & Book
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
          >
            Registration Closed
          </button>
        )}
      </div>
    </motion.div>
  );
}
