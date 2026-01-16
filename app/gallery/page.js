"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react"; // Added Suspense
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  User,
  Heart,
  Download,
  ChevronDown,
  ArrowRight,
  Grid3x3,
  Rows,
  Search,
  Loader2,
  Camera,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

// --- Constants ---
const GALLERY_CATEGORIES = [
  { value: "all", label: "All Photos" },
  { value: "PRODUCT", label: "Products" },
  { value: "WORKSHOP", label: "Workshops" },
  { value: "STUDIO", label: "Studio" },
  { value: "EVENT", label: "Events" },
  { value: "PROCESS", label: "Process" },
  { value: "ARTISAN", label: "Artisans" },
  { value: "CUSTOMER", label: "Customers" },
];

const VIEW_MODES = [
  { value: "masonry", icon: <Grid3x3 className="w-4 h-4" />, label: "Masonry" },
  { value: "grid", icon: <Rows className="w-4 h-4" />, label: "Grid" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: <Calendar className="w-4 h-4" /> },
  { value: "popular", label: "Popular", icon: <Heart className="w-4 h-4" /> },
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

// --- Custom Dropdown Component ---
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
        className="flex items-center justify-between bg-white border-2 border-stone-200 rounded-xl px-4 py-3 hover:border-[#8E5022] transition-colors min-w-[160px]"
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
            className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-stone-200 z-40 overflow-hidden"
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

// 1. Rename your main component to "GalleryContent"
function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth(); 

  // --- State ---
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [categoryCounts, setCategoryCounts] = useState({
    total: 0,
    counts: {},
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [viewMode, setViewMode] = useState("masonry");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Interaction
  const [selectedImage, setSelectedImage] = useState(null);

  // --- Data Fetching ---
  const fetchGallery = useCallback(
    async (isLoadMore = false) => {
      try {
        const currentPage = isLoadMore ? page + 1 : 1;
        if (!isLoadMore) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
          sort: sortBy,
          category: selectedCategory,
          ...(searchQuery && { search: searchQuery }),
        });

        const response = await fetch(`/api/gallery?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to fetch");

        if (isLoadMore) {
          setGalleryItems((prev) => [...prev, ...data.items]);
          setPage(currentPage);
        } else {
          setGalleryItems(data.items);
          setPage(1);
        }

        setHasMore(data.pagination.hasMore);
      } catch (error) {
        console.error("Gallery error:", error);
        toast.error("Failed to load gallery items");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page, selectedCategory, sortBy, searchQuery]
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/gallery/stats");
        if (res.ok) {
          const data = await res.json();
          setCategoryCounts(data);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchStats();
  }, []);

  // Trigger fetch on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGallery(false);
    }, 300); 
    return () => clearTimeout(timer);
  }, [selectedCategory, sortBy, searchQuery]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedCategory, router]);

  // --- Handlers ---
  const handleLike = async (itemId) => {
    if (!user) {
      toast.error("Please login to like photos");
      return;
    }

    // 1. Optimistic Update
    setGalleryItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const isLiked = item.isLiked;
          return {
            ...item,
            isLiked: !isLiked,
            likesCount: isLiked ? item.likesCount - 1 : item.likesCount + 1,
          };
        }
        return item;
      })
    );

    // Update selected image if open
    if (selectedImage?.id === itemId) {
      setSelectedImage((prev) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    }

    // 2. API Call
    try {
      const res = await fetch(`/api/gallery/${itemId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      // Revert on error
      toast.error("Failed to like image");
      fetchGallery(false); // Reload correct state
    }
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
      toast.error("Download failed");
    }
  };

  const openLightbox = (item) => {
    setSelectedImage(item);
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
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-[#C85428] selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-32 pb-16 px-4 overflow-hidden">
        {/* Decorative Background */}
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
                <Sparkles className="w-4 h-4" /> Visual Stories
              </span>
              <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
                The Studio <br />
                <span className="text-[#C85428]">Through Our Lens</span>
              </h1>
              <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                Step inside our world. From clay to kiln, every image tells a
                story of craft at Studio Bashō.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search moments, techniques, or themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-4 bg-white rounded-2xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none shadow-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 pt-8">
            <div className="flex-1 overflow-x-auto pt-2 pb-4 no-scrollbar">
              <div className="flex gap-2">
                {GALLERY_CATEGORIES.map((category) => {
                  const count =
                    category.value === "all"
                      ? categoryCounts.total
                      : categoryCounts.counts[category.value];

                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 ${
                        selectedCategory === category.value
                          ? "bg-[#442D1C] text-white shadow-md"
                          : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm border border-stone-100"
                      }`}
                    >
                      {category.label}
                      {count !== undefined && (
                        <span className="text-xs font-normal">({count})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <CustomDropdown
                value={viewMode}
                options={VIEW_MODES}
                onChange={setViewMode}
              />
              <CustomDropdown
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={setSortBy}
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse break-inside-avoid"
                >
                  <div className="h-64 bg-stone-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : galleryItems.length > 0 ? (
            <div
              className={`gap-8 space-y-8 ${
                viewMode === "masonry"
                  ? "columns-1 md:columns-2 lg:columns-3"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 !space-y-0 gap-8"
              }`}
            >
              {galleryItems.map((item, index) => (
                <div key={item.id} className="break-inside-avoid">
                  <GalleryItem
                    item={item}
                    index={index}
                    onOpen={openLightbox}
                    onLike={handleLike}
                    gridMode={viewMode === "grid"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <Camera className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                No photos found
              </h3>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                No visual stories found. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
              >
                View All Photos
              </button>
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && galleryItems.length > 0 && (
            <div className="mt-16 text-center">
              <button
                onClick={() => fetchGallery(true)}
                disabled={loadingMore}
                className="px-8 py-3.5 bg-white border-2 border-[#EDD8B4] rounded-xl text-[#442D1C] font-medium hover:border-[#C85428] hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" /> Load More Photos
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- LIGHTBOX --- */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
              <span className="text-[#EDD8B4] text-sm font-medium tracking-widest uppercase ml-2">
                {selectedImage.category}
              </span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image */}
            <div
              className="w-full h-full flex items-center justify-center p-4 md:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
                className="absolute left-2 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-40 hidden md:flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <motion.img
                key={selectedImage.image}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={selectedImage.image}
                alt={selectedImage.title}
                className="max-h-[70vh] md:max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
                className="absolute right-2 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-40 hidden md:flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Info */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/10 p-6 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl mb-2 text-[#EDD8B4]">
                    {selectedImage.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#C85428]" /> Studio Team
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C85428]" />{" "}
                      {new Date(selectedImage.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleLike(selectedImage.id)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all border ${
                      selectedImage.isLiked
                        ? "bg-[#C85428]/20 border-[#C85428] text-[#C85428]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        selectedImage.isLiked ? "fill-current" : ""
                      }`}
                    />
                    <span>{selectedImage.likesCount}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(selectedImage.image, selectedImage.title)
                    }
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// --- SUB-COMPONENT ---
function GalleryItem({ item, index, onOpen, onLike, gridMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ y: -8 }}
      onClick={() => onOpen(item)}
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-zoom-in ${
        gridMode ? "aspect-square" : ""
      }`}
    >
      <div className="relative overflow-hidden w-full h-full">
        <img
          src={item.image}
          alt={item.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            gridMode ? "absolute inset-0" : ""
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0 z-10">
          <span className="bg-[#EDD8B4] text-[#442D1C] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            {item.category}
          </span>
          {item.featured && (
            <span className="bg-[#C85428] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(item.id);
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg z-10"
        >
          <Heart
            className={`w-5 h-5 ${
              item.isLiked ? "fill-[#C85428] text-[#C85428]" : "text-stone-400"
            }`}
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 text-white z-10">
          <h4 className="font-serif text-2xl leading-tight mb-2 text-[#EDD8B4]">
            {item.title}
          </h4>
          <p className="text-sm text-stone-200 line-clamp-2 mb-4">
            {item.description}
          </p>
          <div className="flex justify-between items-center text-xs font-medium text-stone-300 border-t border-white/20 pt-4">
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1 text-[#EDD8B4]">
              <ZoomIn className="w-4 h-4" /> View Details
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 2. Default export wraps content in Suspense
export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#8E5022]" />
            <p className="text-[#8E5022] font-serif">Loading Gallery...</p>
          </div>
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}