// app/testimonials/page.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Play, Filter, X, MessageSquare } from "lucide-react";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const SOURCE_FILTERS = [
  { value: "all", label: "All Sources" },
  { value: "Website", label: "Website" },
  { value: "Google", label: "Google" },
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
];

const RATING_FILTERS = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [showFeatured, setShowFeatured] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, [selectedSource, selectedRating, showFeatured]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSource !== "all") params.append("source", selectedSource);
      if (selectedRating !== "all") params.append("minRating", selectedRating);
      if (showFeatured) params.append("featured", "true");

      const response = await fetch(`/api/testimonials?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "fill-[#C85428] text-[#C85428]"
            : "text-stone-300"
        }`}
      />
    ));
  };

  const playVideo = (videoUrl) => {
    setActiveVideo(videoUrl);
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
              Stories That Inspire
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              Voices of Our <span className="text-[#C85428]">Community</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Hear from collectors, workshop participants, and art lovers who
              have experienced Bashō firsthand.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
            {/* Source Filters */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2">
                {SOURCE_FILTERS.map((source) => (
                  <button
                    key={source.value}
                    onClick={() => setSelectedSource(source.value)}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                      selectedSource === source.value
                        ? "bg-[#442D1C] text-white shadow-md"
                        : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating & Featured Filters */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {RATING_FILTERS.map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => setSelectedRating(rating.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedRating === rating.value
                        ? "bg-[#8E5022] text-white"
                        : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    {rating.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFeatured(!showFeatured)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  showFeatured
                    ? "bg-[#C85428] text-white"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                <Star className="w-4 h-4" />
                Featured Only
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-lg animate-pulse p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-stone-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-stone-200 rounded w-24"></div>
                      <div className="h-3 bg-stone-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-stone-200 rounded w-full"></div>
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  index={index}
                  onPlayVideo={playVideo}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                No testimonials found
              </h3>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                No testimonials match your filters. Try different criteria or
                check back soon!
              </p>
              <button
                onClick={() => {
                  setSelectedSource("all");
                  setSelectedRating("all");
                  setShowFeatured(false);
                }}
                className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
              >
                View All Testimonials
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={activeVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TestimonialCard({ testimonial, index, onPlayVideo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative ${
        testimonial.featured ? "border-2 border-[#C85428]" : ""
      }`}
    >
      {testimonial.featured && (
        <div className="absolute -top-3 left-6">
          <div className="bg-[#C85428] text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
            <Star className="w-3 h-3 fill-white" />
            Featured
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        {/* Customer Image or Avatar */}
        <div className="flex-shrink-0">
          {testimonial.image ? (
            <img
              src={testimonial.image}
              alt={testimonial.customerName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#EDD8B4]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#EDD8B4] to-[#C85428] flex items-center justify-center text-white font-serif text-xl">
              {testimonial.customerName.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-stone-800">
            {testimonial.customerName}
          </h4>
          {testimonial.customerRole && (
            <p className="text-sm text-stone-500">{testimonial.customerRole}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(testimonial.rating)
                    ? "fill-[#C85428] text-[#C85428]"
                    : "text-stone-300"
                }`}
              />
            ))}
            <span className="text-sm text-stone-500 ml-2">
              {testimonial.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="w-8 h-8 text-[#EDD8B4]" />
      </div>

      {/* Testimonial Content */}
      <p className="text-stone-600 italic mb-6 line-clamp-5">
        "{testimonial.content}"
      </p>

      {/* Source & Associated Item */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-stone-100">
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">
            Via {testimonial.source}
          </span>

          {testimonial.Product && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#8E5022]"></div>
              <span className="text-xs text-stone-600 truncate max-w-[100px]">
                {testimonial.Product.name}
              </span>
            </div>
          )}

          {testimonial.Workshop && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#652810]"></div>
              <span className="text-xs text-stone-600 truncate max-w-[100px]">
                {testimonial.Workshop.title}
              </span>
            </div>
          )}
        </div>

        {/* Video Play Button */}
        {testimonial.videoUrl && (
          <button
            onClick={() => onPlayVideo(testimonial.videoUrl)}
            className="w-10 h-10 rounded-full bg-[#C85428] flex items-center justify-center hover:bg-[#B54418] transition-colors"
          >
            <Play className="w-5 h-5 text-white fill-white" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
