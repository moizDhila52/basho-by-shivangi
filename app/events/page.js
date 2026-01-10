// app/events/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, MapPin, Filter, X, Heart, ArrowRight, Loader2 
} from "lucide-react";

// Matches the earthy tones from the Workshop page
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
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Past Events" },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("UPCOMING");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState(null); // State for the popup
  
  const [interestedEvents, setInterestedEvents] = useState([]);
  const [processingInterest, setProcessingInterest] = useState({});

  useEffect(() => {
    fetchEvents();
    const savedInterest = JSON.parse(localStorage.getItem("interestedEvents") || "[]");
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
    e.stopPropagation(); // Stop bubble so it doesn't open modal if clicked
    if (interestedEvents.includes(eventId)) return;

    try {
      setProcessingInterest(prev => ({ ...prev, [eventId]: true }));
      const res = await fetch(`/api/events/${eventId}/interest`, { method: "POST" });

      if (res.ok) {
        const newInterestedList = [...interestedEvents, eventId];
        setInterestedEvents(newInterestedList);
        localStorage.setItem("interestedEvents", JSON.stringify(newInterestedList));
      }
    } catch (error) {
      console.error("Failed to mark interest", error);
    } finally {
      setProcessingInterest(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#442D1C]">
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#EDD8B4]/10 -z-10" />
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <div>
              <span className="text-[#8E5022] uppercase tracking-[0.2em] text-xs font-bold mb-2 block">
                Discover
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#442D1C] leading-tight">
                Upcoming <span className="text-[#C85428]">Events</span>
              </h1>
              <p className="text-[#8E5022] mt-4 max-w-lg">
                Join us for exhibitions, workshops, and studio visits. Experience craftsmanship firsthand.
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium border ${
                showFilters 
                  ? "bg-[#442D1C] text-[#EDD8B4] border-[#442D1C]" 
                  : "bg-white text-[#442D1C] border-[#EDD8B4] hover:border-[#8E5022]"
              }`}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Filter Events"}
            </button>
          </motion.div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 bg-white rounded-2xl p-6 border border-[#EDD8B4] shadow-sm"
            >
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-[#8E5022] uppercase tracking-wider mb-3">Event Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedType === type.value ? "bg-[#442D1C] text-white" : "bg-[#FDFBF7] text-[#652810] hover:bg-[#EDD8B4]/30"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#8E5022] uppercase tracking-wider mb-3">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setSelectedStatus(filter.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedStatus === filter.value ? "bg-[#C85428] text-white" : "bg-[#FDFBF7] text-[#652810] hover:bg-[#EDD8B4]/30"
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
        </div>
      </section>

      {/* Events Grid */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          {loading ? (
             <div className="flex items-center justify-center py-20">
               <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
             </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const isInterested = interestedEvents.includes(event.id);
                const isProcessing = processingInterest[event.id];

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl border border-[#EDD8B4] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Image Section - Clicking opens modal */}
                    <div onClick={() => setSelectedEventModal(event)} className="cursor-pointer relative h-56 bg-[#FDFBF7] overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm bg-white/90 text-[#442D1C]">
                          {event.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <div onClick={() => setSelectedEventModal(event)} className="cursor-pointer">
                          <h3 className="font-serif text-2xl font-bold text-[#442D1C] mb-2 hover:text-[#C85428] transition-colors line-clamp-1">
                            {event.title}
                          </h3>
                        </div>
                        <p className="text-[#8E5022] text-sm line-clamp-2">
                          {event.shortDescription || event.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-[#652810] mb-6 font-medium">
                        <div className="flex items-center gap-1.5 bg-[#FDFBF7] px-2 py-1 rounded border border-[#EDD8B4]/50">
                          <Calendar size={14} className="text-[#C85428]" />
                          {formatDate(event.startDate)}
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#FDFBF7] px-2 py-1 rounded border border-[#EDD8B4]/50">
                          <MapPin size={14} className="text-[#C85428]" />
                          {event.location}
                        </div>
                      </div>

                      <div className="h-px bg-[#EDD8B4]/30 w-full mb-4 mt-auto" />

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleInterestClick(e, event.id)}
                          disabled={isInterested || isProcessing}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                            isInterested
                              ? "bg-[#FDFBF7] text-[#C85428] border-[#EDD8B4]"
                              : "bg-[#442D1C] text-[#EDD8B4] border-[#442D1C] hover:bg-[#652810]"
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Heart size={16} className={isInterested ? "fill-current" : ""} />
                          )}
                          {isInterested ? "Already Interested" : "I'm Interested"}
                        </button>

                        <button 
                          onClick={() => setSelectedEventModal(event)}
                          className="w-12 h-11 flex items-center justify-center rounded-xl border border-[#EDD8B4] text-[#442D1C] hover:bg-[#EDD8B4]/20 transition-colors"
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
            <div className="text-center py-20 bg-white rounded-3xl border border-[#EDD8B4] border-dashed">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FDFBF7] border border-[#EDD8B4] flex items-center justify-center">
                <Calendar className="w-10 h-10 text-[#C85428]" />
              </div>
              <h3 className="font-serif text-2xl text-[#442D1C] mb-2">No events found</h3>
              <p className="text-[#8E5022] mb-6">Adjust your filters or check back later.</p>
              <button
                onClick={() => { setSelectedType("all"); setSelectedStatus("UPCOMING"); }}
                className="text-[#442D1C] underline font-medium hover:text-[#C85428]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {selectedEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
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
              <div className="relative h-64 md:h-80 shrink-0">
                <img 
                  src={selectedEventModal.image} 
                  alt={selectedEventModal.title} 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedEventModal(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-stone-600 hover:text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-[#442D1C] text-[#EDD8B4] px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                        {selectedEventModal.type}
                    </span>
                    <span className="bg-white/90 text-[#442D1C] px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Calendar size={14} className="text-[#C85428]" />
                        {formatDate(selectedEventModal.startDate)}
                    </span>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <h2 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-4">
                            {selectedEventModal.title}
                        </h2>
                        
                        <div className="flex items-center gap-2 text-[#8E5022] font-medium mb-6 bg-[#FDFBF7] p-3 rounded-xl border border-[#EDD8B4]/50 w-fit">
                            <MapPin size={18} />
                            {selectedEventModal.location}
                            {selectedEventModal.address && <span className="text-stone-400">| {selectedEventModal.address}</span>}
                        </div>

                        <div className="prose prose-stone max-w-none text-[#652810] mb-8 leading-relaxed">
                            {selectedEventModal.description}
                        </div>

                        {/* GALLERY GRID */}
                        {selectedEventModal.gallery && selectedEventModal.gallery.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-serif text-xl text-[#442D1C] mb-4">Event Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {selectedEventModal.gallery.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-stone-100">
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-stone-100 bg-[#FDFBF7] flex justify-end">
                 <button 
                   onClick={() => setSelectedEventModal(null)}
                   className="px-6 py-3 bg-[#442D1C] text-[#EDD8B4] rounded-xl font-medium hover:bg-[#652810] transition-colors"
                 >
                    Close Details
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}