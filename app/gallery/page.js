// app/gallery/page.js
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Filter,
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  User,
  Heart,
  Share2,
  Download,
  Tag,
  Camera,
  Palette,
  ArrowRight,
  Grid3x3,
  Rows,
} from "lucide-react";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const GALLERY_CATEGORIES = [
  { value: "all", label: "All Photos", icon: "🖼️", count: 0 },
  { value: "PRODUCT", label: "Products", icon: "🍶", count: 42 },
  { value: "WORKSHOP", label: "Workshops", icon: "✂️", count: 28 },
  { value: "STUDIO", label: "Studio", icon: "🏠", count: 19 },
  { value: "EVENT", label: "Events", icon: "🎪", count: 15 },
  { value: "PROCESS", label: "Process", icon: "🌀", count: 37 },
  { value: "ARTISAN", label: "Artisans", icon: "👩‍🎨", count: 23 },
  { value: "CUSTOMER", label: "Customers", icon: "😊", count: 31 },
];

const VIEW_MODES = [
  { value: "masonry", icon: Grid3x3, label: "Masonry" },
  { value: "grid", icon: Rows, label: "Grid" },
];

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [likedImages, setLikedImages] = useState(new Set());
  const [viewMode, setViewMode] = useState("masonry");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      // Simulated real data
      setTimeout(() => {
        const mockData = generateMockGalleryData();
        setGalleryItems(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setLoading(false);
    }
  };

  const generateMockGalleryData = () => {
    const categories = [
      "PRODUCT",
      "WORKSHOP",
      "STUDIO",
      "EVENT",
      "PROCESS",
      "ARTISAN",
      "CUSTOMER",
    ];
    const titles = [
      "Morning Wheel Session",
      "Glaze Experiment #42",
      "Kiln Unloading Day",
      "Hand-building Workshop",
      "Surface Texture Study",
      "Raku Firing Results",
      "Customer's First Pot",
      "Studio Sunset",
      "Clay Preparation",
      "Exhibition Opening",
    ];

    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      image: "showcase/products/" + (i + 1) + ".png",
      title: titles[i % titles.length],
      description:
        "A beautiful moment captured in our studio showing the craft and passion behind each piece.",
      category: categories[i % categories.length],
      date: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      location:
        i % 3 === 0
          ? "Main Studio"
          : i % 3 === 1
          ? "Kiln Room"
          : "Gallery Space",
      photographer: ["Sajid Ahmad", "Maria Chen", "Studio Team"][i % 3],
      featured: i % 5 === 0,
      likes: Math.floor(Math.random() * 100) + 20,
      color: ["#442D1C", "#8E5022", "#C85428", "#652810"][i % 4],
    }));
  };

  const openLightbox = (item, index) => {
    setSelectedImage(item);
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
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

  const toggleLike = (id) => {
    const newLiked = new Set(likedImages);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedImages(newLiked);
  };

  const handleDownload = async (imageUrl, title) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studio-basho-${title
        .toLowerCase()
        .replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const filteredItems = galleryItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Masonry layout groups
  const column1 = filteredItems.filter((_, index) => index % 3 === 0);
  const column2 = filteredItems.filter((_, index) => index % 3 === 1);
  const column3 = filteredItems.filter((_, index) => index % 3 === 2);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/10 pt-32 pb-20 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#8E5022]"
              style={{
                width: Math.random() * 150 + 30 + "px",
                height: Math.random() * 150 + 30 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Visual Stories
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              The Studio <br />
              <span className="text-[#C85428]">Through Our Lens</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10">
              Step inside our world. From clay to kiln, every image tells a
              story of craft, community, and creation at Studio Bashō.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search moments, techniques, or themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#EDD8B4] shadow-lg focus:border-[#C85428] focus:outline-none focus:ring-2 focus:ring-[#C85428]/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <span className="text-sm text-stone-400 bg-white px-2 py-1 rounded-lg">
                  {filteredItems.length} photos
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    viewMode === mode.value
                      ? "bg-[#442D1C] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="overflow-x-auto flex-1 md:px-8">
              <div className="flex gap-2">
                {GALLERY_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
                      selectedCategory === category.value
                        ? "bg-gradient-to-r from-[#442D1C] to-[#652810] text-white shadow-lg"
                        : "bg-white text-stone-600 hover:bg-stone-50 shadow-sm border border-stone-200"
                    }`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span>{category.label}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        selectedCategory === category.value
                          ? "bg-white/20"
                          : "bg-stone-100"
                      }`}
                    >
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <select className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428]">
              <option>Most Recent</option>
              <option>Most Liked</option>
              <option>Oldest First</option>
              <option>Featured</option>
            </select>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="space-y-6">
                  <div
                    className="bg-gradient-to-br from-stone-200 to-stone-100 rounded-2xl animate-pulse"
                    style={{ height: Math.random() * 300 + 200 }}
                  ></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            viewMode === "masonry" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                  {column1.map((item, index) => (
                    <GalleryItem
                      key={item.id}
                      item={item}
                      index={index}
                      onOpen={openLightbox}
                      onLike={toggleLike}
                      liked={likedImages.has(item.id)}
                    />
                  ))}
                </div>
                <div className="space-y-6">
                  {column2.map((item, index) => (
                    <GalleryItem
                      key={item.id}
                      item={item}
                      index={index + 10}
                      onOpen={openLightbox}
                      onLike={toggleLike}
                      liked={likedImages.has(item.id)}
                    />
                  ))}
                </div>
                <div className="space-y-6">
                  {column3.map((item, index) => (
                    <GalleryItem
                      key={item.id}
                      item={item}
                      index={index + 20}
                      onOpen={openLightbox}
                      onLike={toggleLike}
                      liked={likedImages.has(item.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                  <GalleryItem
                    key={item.id}
                    item={item}
                    index={index}
                    onOpen={openLightbox}
                    onLike={toggleLike}
                    liked={likedImages.has(item.id)}
                    gridMode
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-stone-100 to-[#EDD8B4]/20 flex items-center justify-center">
                <Camera className="w-16 h-16 text-stone-400" />
              </div>
              <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                No photos found
              </h3>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search or browse all categories.`
                  : "No gallery items in this category yet. Check other categories or come back soon!"}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white px-8 py-3 rounded-xl font-medium hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
              >
                Explore All Photos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Load More Button */}
          {filteredItems.length > 0 && !loading && (
            <div className="text-center mt-16">
              <button className="px-8 py-3.5 bg-white border-2 border-[#EDD8B4] rounded-xl text-[#442D1C] font-medium hover:border-[#C85428] hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Load More Photos
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
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-6xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={closeLightbox}
                className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-all duration-300 hover:scale-110"
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>

              {/* Navigation Buttons */}
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Action Buttons */}
              <div className="absolute top-6 left-6 z-10 flex gap-3">
                <button
                  onClick={() => toggleLike(selectedImage.id)}
                  className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    likedImages.has(selectedImage.id)
                      ? "bg-red-500/20 text-red-400"
                      : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedImages.has(selectedImage.id) ? "fill-current" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() =>
                    handleDownload(selectedImage.image, selectedImage.title)
                  }
                  className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 hover:scale-110"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 hover:scale-110">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Image Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full bg-black rounded-2xl overflow-hidden"
              >
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </motion.div>

              {/* Image Info Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8 text-white"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-serif text-2xl md:text-3xl">
                        {selectedImage.title}
                      </h3>
                      {selectedImage.featured && (
                        <span className="px-3 py-1 bg-gradient-to-r from-[#C85428] to-[#8E5022] rounded-full text-sm font-medium">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-white/80 mb-4 max-w-2xl">
                      {selectedImage.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#EDD8B4]" />
                        <span className="bg-white/10 px-3 py-1 rounded-full">
                          {selectedImage.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#EDD8B4]" />
                        <span>
                          {new Date(selectedImage.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#EDD8B4]" />
                        <span>{selectedImage.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#EDD8B4]" />
                        <span>Photo by {selectedImage.photographer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(selectedImage.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          likedImages.has(selectedImage.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      <span>
                        {selectedImage.likes +
                          (likedImages.has(selectedImage.id) ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Counter */}
              <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                {lightboxIndex + 1} / {galleryItems.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function GalleryItem({ item, index, onOpen, onLike, liked, gridMode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
        gridMode ? "aspect-square" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen(item, index)}
    >
      <div
        className={`relative ${gridMode ? "h-full" : "h-64 md:h-80 lg:h-96"}`}
      >
        {/* Image */}
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-stone-700 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.category}
          </span>
          {item.featured && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white rounded-full text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(item.id);
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 ${
              liked ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-serif text-lg text-[#442D1C] font-medium truncate">
                {item.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-stone-500">
                <Heart className="w-3 h-3" />
                <span>{item.likes + (liked ? 1 : 0)}</span>
              </div>
            </div>

            <p className="text-sm text-stone-600 line-clamp-2 mb-3">
              {item.description}
            </p>

            <div className="flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.photographer}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[#C85428]">
                <ZoomIn className="w-4 h-4" />
                View
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
