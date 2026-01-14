"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Utility for formatting dates
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function ReviewGallery({ reviews }) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Open Lightbox
  const openLightbox = (review, index = 0) => {
    setSelectedReview(review);
    setLightboxIndex(index);
  };

  // Close Lightbox
  const closeLightbox = () => {
    setSelectedReview(null);
    setLightboxIndex(0);
  };

  // Navigation
  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedReview?.images) {
      setLightboxIndex((prev) => (prev + 1) % selectedReview.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedReview?.images) {
      setLightboxIndex(
        (prev) => (prev - 1 + selectedReview.images.length) % selectedReview.images.length
      );
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#EDD8B4]">
        <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-6">
          <Star className="w-8 h-8 text-[#EDD8B4]" />
        </div>
        <h2 className="text-2xl font-serif text-[#442D1C] mb-2">No reviews yet</h2>
        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
          Share your experience with your collection to see it here.
        </p>
        <Link href="/profile/orders">
          <button className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-all shadow-lg hover:shadow-xl">
            Review an Order
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* --- INSTAGRAM STYLE GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
        {reviews.map((review) => {
          const hasImages = review.images && review.images.length > 0;
          const formattedDate = formatDate(review.createdAt);

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={review.id}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-stone-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col ${hasImages ? 'bg-stone-900' : 'bg-white'}`}
              onClick={() => hasImages ? openLightbox(review) : null}
            >
              {/* CONTENT LAYER */}
              {hasImages ? (
                // A. IMAGE TILE (Clickable for Lightbox)
                <>
                  <Image
                    src={review.images[0]}
                    alt="Review"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Photo Count Badge */}
                  {review.images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {review.images.length}
                    </div>
                  )}

                   {/* Bottom Info */}
                   <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                     <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'fill-[#EDD8B4] text-[#EDD8B4]' : 'text-white/40'} />
                      ))}
                    </div>
                     <Link href={`/products/${review.Product.slug}`} onClick={(e) => e.stopPropagation()} className="block w-fit">
                      <p className="font-bold text-sm hover:underline truncate text-white">
                        {review.Product.name}
                      </p>
                    </Link>
                     <p className="text-xs text-white/70 mt-1">{formattedDate}</p>
                   </div>
                </>
              ) : (
                // B. TEXT ONLY TILE (Not clickable for Lightbox)
                <div className="flex-1 p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex text-[#C85428]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < review.rating ? 'fill-current' : 'text-stone-200'} />
                        ))}
                      </div>
                      <p className="text-xs text-stone-400 font-medium">{formattedDate}</p>
                    </div>
                    <blockquote className="text-[#442D1C] font-serif text-lg leading-relaxed line-clamp-5 relative pl-4 border-l-2 border-[#EDD8B4]">
                     Wait...
                    </blockquote>
                  </div>
                  <div className="pt-4 border-t border-stone-100">
                    <Link href={`/products/${review.Product.slug}`} onClick={(e) => e.stopPropagation()}>
                      <p className="font-bold text-sm text-[#8E5022] hover:underline truncate">
                        {review.Product.name}
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* --- LIGHTBOX MODAL (Unchanged) --- */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 bg-black/20 p-2 rounded-full"
            >
              <X size={24} />
            </button>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-0 h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
              
              {/* LEFT: IMAGE SLIDER */}
              <div className="lg:col-span-2 relative flex items-center justify-center bg-black">
                <img
                  src={selectedReview.images[lightboxIndex]}
                  alt="Review"
                  className="max-h-full max-w-full object-contain"
                />
                
                {/* Nav Buttons */}
                {selectedReview.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm transition-all">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm transition-all">
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Thumbnails (if multiple) */}
                {selectedReview.images.length > 1 && (
                  <div className="absolute bottom-6 flex gap-2 p-2 bg-black/30 rounded-full backdrop-blur-sm">
                    {selectedReview.images.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all ${idx === lightboxIndex ? 'bg-white w-4' : 'bg-white/50'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: DETAILS PANEL */}
              <div className="hidden lg:flex flex-col h-full">
                {/* Product Header */}
                <div className="p-6 border-b border-stone-100 flex items-center gap-4 bg-[#FDFBF7]">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-200 bg-white shrink-0">
                    <img 
                      src={selectedReview.Product.images?.[0] || '/placeholder.jpg'} 
                      className="w-full h-full object-cover" 
                      alt={selectedReview.Product.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-[#442D1C] text-lg leading-tight mb-1 truncate">
                      {selectedReview.Product.name}
                    </h3>
                    <Link href={`/products/${selectedReview.Product.slug}`}>
                      <span className="text-xs font-bold text-[#8E5022] uppercase tracking-wider hover:underline">
                        View Product
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Review Body */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex gap-1 mb-4 text-[#C85428]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className={i < selectedReview.rating ? 'fill-current' : 'text-stone-300'} />
                    ))}
                  </div>
                  <p className="text-stone-600 text-lg leading-relaxed italic mb-6 font-serif">
                    "{selectedReview.comment}"
                  </p>
                  <p className="text-sm text-stone-400">
                    Reviewed on {formatDate(selectedReview.createdAt)}
                  </p>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
                  <p className="text-xs text-stone-500 font-medium flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Verified Purchase
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}