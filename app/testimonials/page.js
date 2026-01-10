"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Upload,
  Star,
  Video,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  User
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
// Import your UI component
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Submission Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Read More Modal
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ approved: "true" });
      const response = await fetch(`/api/testimonials?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Format data for the Cards Component
  const formattedTestimonials = testimonials.map((t) => ({
    quote: t.content,
    name: t.customerName,
    title: t.customerRole || "Verified Customer",
    image: t.image,        // Attachment Image
    video: t.videoUrl,     // Attachment Video
    rating: t.rating,
    isAnonymous: t.isAnonymous 
  }));

  // Split Logic: If > 7 items, create two rows.
  const firstRow = formattedTestimonials.slice(0, 7);
  const secondRow = formattedTestimonials.length > 7 ? formattedTestimonials.slice(7) : [];

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 overflow-hidden font-sans">
      <section className="relative pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-[85vh]">
        
        {/* Header Section */}
        <div className="max-w-7xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              Community Love
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              Voices of <span className="text-[#C85428]">Bashō</span>
            </h1>
            <p className="text-stone-600 max-w-2xl mx-auto text-lg">
              Hear from the artisans, collectors, and students who make our community special.
            </p>
          </motion.div>
        </div>

        {/* INFINITE CARDS CONTAINER */}
        <div className="flex flex-col gap-6 w-full items-center justify-center relative overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center gap-3 text-[#8E5022]">
              <Loader2 className="animate-spin" size={24} />
              <span className="font-medium">Loading community stories...</span>
            </div>
          ) : formattedTestimonials.length > 0 ? (
            <>
              {/* Row 1: Moves Right */}
              <InfiniteMovingCards
                items={firstRow}
                direction="right"
                speed="slow"
                // Pass handler for Read More
                onReadMore={(item) => setSelectedTestimonial(item)} 
              />
              
              {/* Row 2: Moves Left (Only if we have enough items) */}
              {secondRow.length > 0 && (
                <InfiniteMovingCards
                  items={secondRow}
                  direction="left"
                  speed="slow"
                  // Pass handler for Read More
                  onReadMore={(item) => setSelectedTestimonial(item)}
                />
              )}
            </>
          ) : (
            <div className="text-center p-8 bg-white/50 rounded-2xl border border-stone-200">
              <p className="text-stone-500 mb-4">No stories yet. Be the first to share yours!</p>
            </div>
          )}
        </div>

        <div className="mt-12">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-[#442D1C] text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:bg-[#652810] hover:shadow-xl transition-all flex items-center gap-3 mx-auto transform hover:-translate-y-1"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Share Your Story
          </button>
        </div>
      </section>

      {/* SUBMISSION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <SubmissionModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* READ MORE MODAL */}
      <AnimatePresence>
        {selectedTestimonial && (
          <ReadMoreModal 
            item={selectedTestimonial} 
            onClose={() => setSelectedTestimonial(null)} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ==========================================
// COMPONENT: READ MORE MODAL
// ==========================================
function ReadMoreModal({ item, onClose }) {
  const isAnonymous = item.isAnonymous;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-stone-100 rounded-full text-stone-500 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {/* Header User Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#EDD8B4] flex items-center justify-center text-[#442D1C] font-bold text-xl shadow-inner shrink-0">
               {isAnonymous ? <User size={24} /> : (item.name ? item.name.charAt(0).toUpperCase() : "?")}
            </div>
            <div>
              <h3 className="font-serif text-2xl text-[#442D1C]">
                {isAnonymous ? "Anonymous" : item.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span>{isAnonymous ? "Verified Buyer" : item.title}</span>
                {/* Stars */}
                <div className="flex gap-0.5 ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={cn(
                        "fill-[#C85428] text-[#C85428]",
                        i >= (item.rating || 5) && "opacity-30"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Content */}
          <div className="space-y-6">
            <p className="text-stone-700 text-lg leading-relaxed italic">
              "{item.quote}"
            </p>

            {/* Media in Modal */}
            <div className="grid gap-6">
              {item.video && (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-sm">
                  <video
                    src={item.video}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay={false}
                  />
                </div>
              )}
              {item.image && (
                <div className="rounded-2xl overflow-hidden shadow-sm">
                  <img
                    src={item.image}
                    alt="Full size attachment"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-stone-100 bg-stone-50 text-center shrink-0">
           <button 
             onClick={onClose}
             className="text-[#8E5022] font-bold hover:underline"
           >
             Close Review
           </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// COMPONENT: SUBMISSION MODAL
// ==========================================
function SubmissionModal({ onClose }) {
  const { user } = useAuth(); // Ensure AuthProvider exists
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loading states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerRole: "",
    content: "",
    rating: 5,
    image: "",
    videoUrl: "",
    source: "Website",
    isAnonymous: false,
  });

  const handleUpload = async (file, type) => {
    if (type === "image") setUploadingImage(true);
    if (type === "video") setUploadingVideo(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();

      if (type === "image") setUploadingImage(false);
      if (type === "video") setUploadingVideo(false);

      if (result.error) throw new Error(result.error.message);
      return result.secure_url;
    } catch (err) {
      console.error("Upload failed", err);
      if (type === "image") setUploadingImage(false);
      if (type === "video") setUploadingVideo(false);
      alert("Upload failed. Please try again.");
      return null;
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await handleUpload(file, type);
    if (url) {
      setFormData((prev) => ({
        ...prev,
        [type === "video" ? "videoUrl" : "image"]: url,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage || uploadingVideo) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl text-[#442D1C] mb-1">
                  Share experience
                </h2>
                <p className="text-stone-500 text-sm">We'd love to hear from you!</p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  How was your experience?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? "fill-[#C85428] text-[#C85428]"
                            : "text-stone-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Info & Anonymous Toggle */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Name
                    </label>
                    <input
                      required
                      type="text"
                      disabled={formData.isAnonymous}
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border outline-none transition-all",
                        formData.isAnonymous
                          ? "bg-stone-100 border-stone-200 text-stone-400"
                          : "border-stone-200 focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                      )}
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Role (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.customerRole}
                      onChange={(e) =>
                        setFormData({ ...formData, customerRole: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022] outline-none transition-all"
                      placeholder="e.g. Art Lover"
                    />
                  </div>
                </div>

                {/* Anonymous Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      formData.isAnonymous
                        ? "bg-[#442D1C] border-[#442D1C]"
                        : "border-stone-300 group-hover:border-[#442D1C]"
                    }`}
                  >
                    {formData.isAnonymous && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.isAnonymous}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isAnonymous: e.target.checked }))
                    }
                  />
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    {formData.isAnonymous ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Keep me anonymous</span>
                  </div>
                </label>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Your Story
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 h-32 outline-none resize-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022] transition-all"
                  placeholder="Tell us about your experience with Bashō..."
                />
              </div>

              {/* Upload Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* IMAGE UPLOAD CARD */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
                    formData.image
                      ? "border-green-400 bg-green-50"
                      : uploadingImage
                      ? "border-[#8E5022] bg-amber-50"
                      : "border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={uploadingImage}
                  />
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="animate-spin text-green-600" size={24} />
                        <span className="text-xs text-green-700 font-medium animate-pulse">
                          Uploading...
                        </span>
                      </>
                    ) : formData.image ? (
                      <>
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <span className="text-xs text-green-700 font-bold">
                          Image Attached
                        </span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-stone-400" />
                        <span className="text-xs text-stone-500 font-medium">
                          Add Photo
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* VIDEO UPLOAD CARD */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
                    formData.videoUrl
                      ? "border-green-400 bg-green-50"
                      : uploadingVideo
                      ? "border-[#8E5022] bg-amber-50"
                      : "border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, "video")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={uploadingVideo}
                  />
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    {uploadingVideo ? (
                      <>
                        <Loader2 className="animate-spin text-green-600" size={24} />
                        <span className="text-xs text-green-700 font-medium animate-pulse">
                          Uploading...
                        </span>
                      </>
                    ) : formData.videoUrl ? (
                      <>
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <span className="text-xs text-green-700 font-bold">
                          Video Attached
                        </span>
                      </>
                    ) : (
                      <>
                        <Video size={24} className="text-stone-400" />
                        <span className="text-xs text-stone-500 font-medium">
                          Add Video
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || uploadingImage || uploadingVideo}
                className="w-full bg-[#442D1C] text-white py-4 rounded-xl font-medium hover:bg-[#2B1B12] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#442D1C]/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          ) : (
            // SUCCESS VIEW
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
                <Upload size={32} />
              </div>
              <h3 className="font-serif text-3xl mb-3 text-[#442D1C]">Thank you!</h3>
              <p className="text-stone-600 mb-8 px-4">
                Your review has been submitted successfully. It will appear on our page once approved by our team.
              </p>
              <button
                onClick={onClose}
                className="bg-stone-100 text-stone-800 px-10 py-3 rounded-xl font-medium hover:bg-stone-200 transition-colors w-full"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}