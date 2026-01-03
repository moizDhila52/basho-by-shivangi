// app/events/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ChevronRight, Filter, X } from "lucide-react";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
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
  { value: "UPCOMING", label: "Upcoming", color: "#10B981" },
  { value: "ONGOING", label: "Ongoing", color: "#3B82F6" },
  { value: "COMPLETED", label: "Past Events", color: "#6B7280" },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("UPCOMING");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "UPCOMING":
        return "#10B981";
      case "ONGOING":
        return "#3B82F6";
      case "COMPLETED":
        return "#6B7280";
      case "CANCELLED":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "EXHIBITION":
        return "🎨";
      case "POPUP":
        return "🛍️";
      case "WORKSHOP":
        return "✂️";
      case "STUDIO_OPEN":
        return "🏠";
      default:
        return "📅";
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              Experiences & Exhibitions
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              Where Art <span className="text-[#C85428]">Comes Alive</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Join us for exhibitions, workshops, and studio visits. Experience
              craftsmanship firsthand.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
            {/* Type Filters */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                      selectedType === type.value
                        ? "bg-[#442D1C] text-white shadow-md"
                        : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border-2 border-stone-200 rounded-xl px-6 py-3 hover:border-[#8E5022] transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filter by Status
              </button>
            </div>
          </div>

          {/* Status Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium text-stone-700">Filter by Status</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setSelectedStatus(filter.value);
                      setShowFilters(false);
                    }}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${
                      selectedStatus === filter.value
                        ? "bg-opacity-20 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                    style={{
                      backgroundColor:
                        selectedStatus === filter.value
                          ? `${filter.color}33`
                          : undefined,
                      color:
                        selectedStatus === filter.value
                          ? filter.color
                          : undefined,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: filter.color }}
                    />
                    {filter.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-lg animate-pulse"
                >
                  <div className="h-64 bg-stone-200 rounded-t-3xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                    <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                    <div className="h-4 bg-stone-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Event Image */}
                  <Link href={`/events/${event.slug}`}>
                    <div className="relative h-64 overflow-hidden cursor-pointer">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Event Type Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                          <span className="text-lg">
                            {getEventTypeIcon(event.type)}
                          </span>
                          <span className="text-sm font-medium text-stone-700">
                            {event.type.charAt(0) +
                              event.type.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div
                          className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                          style={{
                            backgroundColor: getStatusColor(event.status),
                          }}
                        >
                          {event.status.charAt(0) +
                            event.status.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Event Info */}
                  <div className="p-6">
                    <Link href={`/events/${event.slug}`}>
                      <div className="cursor-pointer mb-4">
                        <h3 className="font-serif text-2xl text-[#442D1C] mb-2 group-hover:text-[#C85428] transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-stone-600 line-clamp-2">
                          {event.shortDescription ||
                            event.description.substring(0, 120)}
                          ...
                        </p>
                      </div>
                    </Link>

                    {/* Event Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-stone-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">
                          {formatDate(event.startDate)} -{" "}
                          {formatDate(event.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-stone-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      {event.address && (
                        <div className="flex items-start gap-3 text-stone-500 text-sm">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{event.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link href={`/events/${event.slug}`}>
                      <button className="w-full bg-transparent border-2 border-[#442D1C] text-[#442D1C] py-3 rounded-xl font-medium hover:bg-[#442D1C] hover:text-white transition-all flex items-center justify-center gap-2">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                No events found
              </h3>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                {selectedStatus === "COMPLETED"
                  ? "Check back soon for past event archives."
                  : "No upcoming events at the moment. Check back soon!"}
              </p>
              <button
                onClick={() => {
                  setSelectedType("all");
                  setSelectedStatus("UPCOMING");
                }}
                className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
              >
                View All Upcoming Events
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
