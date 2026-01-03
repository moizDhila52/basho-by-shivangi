// app/gallery/page.js
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Filter, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const GALLERY_CATEGORIES = [
  { value: "all", label: "All Photos", icon: "🖼️" },
  { value: "PRODUCT", label: "Products", icon: "🍶" },
  { value: "WORKSHOP", label: "Workshops", icon: "✂️" },
  { value: "STUDIO", label: "Studio", icon: "🏠" },
  { value: "EVENT", label: "Events", icon: "🎪" },
  { value: "PROCESS", label: "Process", icon: "🌀" },
  { value: "ARTISAN", label: "Artisans", icon: "👩‍🎨" },
  { value: "CUSTOMER", label: "Customers", icon: "😊" },
];

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/gallery?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setGalleryItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (item, index) => {
    setSelectedImage(item);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateLightbox = (direction) => {
    if (!selectedImage) return;

    const currentIndex = galleryItems.findIndex(
      (item) => item.id === selectedImage.id
    );
    let newIndex;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : galleryItems.length - 1;
    } else {
      newIndex = currentIndex < galleryItems.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedImage(galleryItems[newIndex]);
    setLightboxIndex(newIndex);
  };

  // Masonry layout groups
  const column1 = galleryItems.filter((_, index) => index % 3 === 0);
  const column2 = galleryItems.filter((_, index) => index % 3 === 1);
  const column3 = galleryItems.filter((_, index) => index % 3 === 2);

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
              Visual Stories
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              Through the{" "}
              <span className="text-[#C85428]">Maker&apos;s Lens</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              A glimpse into our studio, processes, and the moments that bring
              our ceramics to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-4">
              {GALLERY_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
                    selectedCategory === category.value
                      ? "bg-[#442D1C] text-white shadow-md"
                      : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid - Masonry Layout */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-6">
                  <div
                    className="bg-stone-200 rounded-2xl animate-pulse"
                    style={{ height: Math.random() * 200 + 200 }}
                  ></div>
                  <div
                    className="bg-stone-200 rounded-2xl animate-pulse"
                    style={{ height: Math.random() * 200 + 200 }}
                  ></div>
                </div>
              ))}
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Column 1 */}
              <div className="space-y-6">
                {column1.map((item, index) => (
                  <GalleryItem
                    key={item.id}
                    item={item}
                    index={index * 3}
                    onOpen={openLightbox}
                  />
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                {column2.map((item, index) => (
                  <GalleryItem
                    key={item.id}
                    item={item}
                    index={index * 3 + 1}
                    onOpen={openLightbox}
                  />
                ))}
              </div>

              {/* Column 3 */}
              <div className="space-y-6">
                {column3.map((item, index) => (
                  <GalleryItem
                    key={item.id}
                    item={item}
                    index={index * 3 + 2}
                    onOpen={openLightbox}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <Filter className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                No photos found
              </h3>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                No gallery items in this category yet. Check other categories or
                come back soon!
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
              >
                View All Photos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-6xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Image */}
              <div className="relative w-full h-full">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full h-[90vh] object-contain rounded-lg"
                />

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <h3 className="font-serif text-2xl mb-2">
                    {selectedImage.title}
                  </h3>
                  {selectedImage.description && (
                    <p className="text-white/80 mb-2">
                      {selectedImage.description}
                    </p>
                  )}
                  {selectedImage.Event && (
                    <p className="text-white/60 text-sm">
                      From: {selectedImage.Event.title}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {selectedImage.category}
                    </span>
                    {selectedImage.featured && (
                      <span className="px-3 py-1 bg-[#C85428]/80 rounded-full text-sm">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                {lightboxIndex + 1} / {galleryItems.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function GalleryItem({ item, index, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      onClick={() => onOpen(item, index)}
    >
      <div className="relative aspect-square">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Overlay Info */}
        <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-white">
            <h3 className="font-medium text-lg mb-1">{item.title}</h3>
            {item.description && (
              <p className="text-white/80 text-sm line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Zoom Icon */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ZoomIn className="w-5 h-5 text-white" />
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-stone-700">
            {item.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
