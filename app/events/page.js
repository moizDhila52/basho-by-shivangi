// app/events/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Filter,
  X,
  Heart,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronDown,
  Clock,
  Ticket,
} from "lucide-react";

// --- Shared Constants & Colors ---
const COLORS = {
  dark: "#442D1C",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const EVENT_TYPES = [
  { value: "all", label: "All Events" },
  { value: "EXHIBITION", label: "Exhibitions" },
  { value: "POPUP", label: "Pop-ups" },
  { value: "WORKSHOP", label: "Workshops" },
  { value: "STUDIO_OPEN", label: "Studio Openings" },
];

const STATUS_FILTERS = [
  {
    value: "UPCOMING",
    label: "Upcoming",
    icon: <Calendar className="w-4 h-4" />,
  },
  { value: "ONGOING", label: "Ongoing", icon: <Clock className="w-4 h-4" /> },
  {
    value: "COMPLETED",
    label: "Past Events",
    icon: <Filter className="w-4 h-4" />,
  },
];

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

// --- Custom Dropdown Component (Matching other pages) ---
const CustomDropdown = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-white border-2 border-stone-200 rounded-xl px-4 py-3 hover:border-[#8E5022] transition-colors min-w-[180px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-stone-600">{selectedOption.icon}</span>
          <span className="font-medium text-sm text-stone-700">
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-full min-w-[180px] bg-white rounded-xl shadow-2xl border border-stone-200 z-40 overflow-hidden"
          >
            <div className="py-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-stone-50 transition-colors ${
                    value === option.value
                      ? "bg-[#FDFBF7] text-[#8E5022]"
                      : "text-stone-600"
                  }`}
                >
                  <span
                    className={`${
                      value === option.value
                        ? "text-[#8E5022]"
                        : "text-stone-400"
                    }`}
                  >
                    {option.icon}
                  </span>
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("UPCOMING");

  // Interaction
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [interestedEvents, setInterestedEvents] = useState([]);
  const [processingInterest, setProcessingInterest] = useState({});

  useEffect(() => {
    fetchEvents();
    const savedInterest = JSON.parse(
      localStorage.getItem("interestedEvents") || "[]"
    );
    setInterestedEvents(savedInterest);
  }, [selectedType, selectedStatus]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestClick = async (e, eventId) => {
    e.stopPropagation();
    if (interestedEvents.includes(eventId)) return;

    try {
      setProcessingInterest((prev) => ({ ...prev, [eventId]: true }));
      const res = await fetch(`/api/events/${eventId}/interest`, {
        method: "POST",
      });

      if (res.ok) {
        const newInterestedList = [...interestedEvents, eventId];
        setInterestedEvents(newInterestedList);
        localStorage.setItem(
          "interestedEvents",
          JSON.stringify(newInterestedList)
        );
      }
    } catch (error) {
      console.error("Failed to mark interest", error);
    } finally {
      setProcessingInterest((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#442D1C] font-sans selection:bg-[#C85428] selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-32 pb-16 px-4 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#8E5022]"
              style={{
                width: Math.random() * 100 + 20 + "px",
                height: Math.random() * 100 + 20 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                opacity: Math.random() * 0.2 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-12"
          >
            <motion.div variants={fadeInUp}>
              <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Curated Gatherings
              </span>
              <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
                Upcoming <br />
                <span className="text-[#C85428]">Exhibitions & Events</span>
              </h1>
              <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                Join us for exhibitions, workshops, and studio visits.
                Experience craftsmanship firsthand in our community.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Controls Container */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 pt-8">
            {/* Category Filter Pills */}
            <div className="flex-1 overflow-x-auto pt-2 pb-4 no-scrollbar">
              <div className="flex gap-2">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 ${
                      selectedType === type.value
                        ? "bg-[#442D1C] text-white shadow-md"
                        : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm border border-stone-100"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Filter */}
            <div className="flex items-center gap-4 flex-wrap">
              <CustomDropdown
                value={selectedStatus}
                options={STATUS_FILTERS}
                onChange={setSelectedStatus}
              />
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse h-96"
                >
                  <div className="h-48 bg-stone-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const isInterested = interestedEvents.includes(event.id);
                const isProcessing = processingInterest[event.id];

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-stone-100"
                  >
                    {/* Image Section */}
                    <div
                      onClick={() => setSelectedEventModal(event)}
                      className="cursor-pointer relative h-64 bg-[#FDFBF7] overflow-hidden"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-white/90 text-[#442D1C] shadow-sm">
                          {event.type}
                        </span>
                      </div>

                      {/* Date Badge overlay */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-[#442D1C]/90 backdrop-blur text-[#EDD8B4] px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                          <Calendar size={12} /> {formatDate(event.startDate)}
                        </span>
                      </div>
                    </div>

                    <div className="p-7 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3
                          onClick={() => setSelectedEventModal(event)}
                          className="font-serif text-2xl font-medium text-[#442D1C] mb-2 hover:text-[#C85428] transition-colors line-clamp-1 cursor-pointer"
                        >
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#8E5022] font-medium uppercase tracking-wide mb-3">
                          <MapPin size={12} /> {event.location}
                        </div>
                        <p className="text-stone-600 text-sm line-clamp-2 leading-relaxed">
                          {event.shortDescription || event.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-6 border-t border-stone-100 flex items-center gap-3">
                        <button
                          onClick={(e) => handleInterestClick(e, event.id)}
                          disabled={isInterested || isProcessing}
                          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                            isInterested
                              ? "bg-[#FDFBF7] text-[#C85428] border-[#EDD8B4]"
                              : "bg-[#442D1C] text-[#EDD8B4] border-[#442D1C] hover:bg-[#652810]"
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Heart
                              size={16}
                              className={isInterested ? "fill-current" : ""}
                            />
                          )}
                          {isInterested ? "Interested" : "I'm Interested"}
                        </button>

                        <button
                          onClick={() => setSelectedEventModal(event)}
                          className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-stone-200 text-[#442D1C] hover:border-[#8E5022] hover:text-[#8E5022] transition-colors"
                        >
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <Ticket className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                No events found
              </h3>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                We couldn't find any events matching your criteria. Try
                adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedType("all");
                  setSelectedStatus("UPCOMING");
                }}
                className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- POPUP MODAL --- */}
      <AnimatePresence>
        {selectedEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedEventModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            >
              {/* Modal Header Image */}
              <div className="relative h-64 md:h-80 shrink-0 bg-stone-200">
                <img
                  src={selectedEventModal.image}
                  alt={selectedEventModal.title}
                  className="w-full h-full object-cover"
                />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-6 left-6 flex gap-3">
                  <span className="bg-[#EDD8B4] text-[#442D1C] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    {selectedEventModal.type}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar bg-white">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex-1">
                    <h2 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-4 leading-tight">
                      {selectedEventModal.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#8E5022] font-medium mb-8">
                      <span className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-1.5 rounded-lg border border-[#EDD8B4]">
                        <Calendar size={16} />{" "}
                        {formatDate(selectedEventModal.startDate)}
                      </span>
                      <span className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-1.5 rounded-lg border border-[#EDD8B4]">
                        <MapPin size={16} /> {selectedEventModal.location}
                      </span>
                    </div>

                    <div className="prose prose-stone prose-lg max-w-none text-stone-600 leading-relaxed mb-10">
                      {selectedEventModal.description}
                    </div>

                    {/* Gallery Grid inside Modal */}
                    {selectedEventModal.gallery &&
                      selectedEventModal.gallery.length > 0 && (
                        <div className="border-t border-stone-100 pt-8">
                          <h3 className="font-serif text-xl text-[#442D1C] mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#C85428]" />{" "}
                            Event Highlights
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedEventModal.gallery.map((img, idx) => (
                              <div
                                key={idx}
                                className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-100"
                              >
                                <img
                                  src={img}
                                  alt={`Gallery ${idx}`}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-stone-100 bg-[#FDFBF7] flex justify-end gap-3">
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="px-6 py-3 border-2 border-[#EDD8B4] text-[#442D1C] rounded-xl font-bold hover:bg-[#EDD8B4]/20 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={(e) => {
                    handleInterestClick(e, selectedEventModal.id);
                    setSelectedEventModal(null);
                  }}
                  disabled={interestedEvents.includes(selectedEventModal.id)}
                  className="px-8 py-3 bg-[#442D1C] text-[#EDD8B4] rounded-xl font-bold hover:bg-[#652810] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {interestedEvents.includes(selectedEventModal.id)
                    ? "Already Registered"
                    : "Register Interest"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
