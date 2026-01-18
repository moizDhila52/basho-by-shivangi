"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Star,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Video,
  Image as ImageIcon,
  ExternalLink,
  PlayCircle,
  EyeOff,
  Eye,
  Upload,   // Added
  Loader2,  // Added
  X         // Added
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testimonials`);
      const data = await response.json();

      if (data.success) {
        setTestimonials(data.data);
      } else {
        toast.error("Failed to load testimonials");
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (testimonialId) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true, isActive: true }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Testimonial approved!");
        fetchTestimonials();
      }
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (testimonialId) => {
    if (!confirm("Are you sure you want to reject and hide this testimonial?")) return;
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false, isActive: false }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Testimonial rejected");
        fetchTestimonials();
      }
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!confirm("Are you sure you want to permanently delete this testimonial?")) return;
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Deleted successfully");
        fetchTestimonials();
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const toggleFeatured = async (testimonialId, currentlyFeatured) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentlyFeatured }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(currentlyFeatured ? "Removed from featured" : "Added to featured");
        fetchTestimonials();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Filter Logic
  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.source?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "pending") return !t.approved && matchesSearch;
    if (statusFilter === "approved") return t.approved && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#442D1C]">
            Testimonials
          </h1>
          <p className="text-stone-600 mt-1">
            Manage customer reviews and community stories
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-[#EDD8B4] flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-amber-500"></div>
             <span className="text-sm font-medium text-stone-600">
               {testimonials.filter(t => !t.approved).length} Pending
             </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-[#EDD8B4] flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <span className="text-sm font-medium text-stone-600">
               {testimonials.filter(t => t.approved).length} Active
             </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDD8B4]/30">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, content, or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FDFBF7] rounded-xl border border-[#EDD8B4] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-[#FDFBF7] p-1 rounded-xl border border-[#EDD8B4] overflow-hidden">
            {["pending", "approved", "all"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all capitalize
                  ${
                    statusFilter === status
                      ? "bg-[#442D1C] text-[#EDD8B4] shadow-sm"
                      : "text-stone-500 hover:text-[#442D1C] hover:bg-stone-100"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDD8B4]/30 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E5022]"></div>
            <p className="mt-4 text-stone-500">Loading reviews...</p>
          </div>
        ) : filteredTestimonials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FDFBF7] border-b border-[#EDD8B4]">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">User Info</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Content</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Rating</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Media</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTestimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                    
                    {/* 1. USER INFO */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                           {t.image && !t.image.includes('cloudinary') ? (
                              <img src={t.image} alt={t.customerName} className="w-10 h-10 rounded-full object-cover border border-[#EDD8B4]" />
                           ) : (
                              <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center text-[#442D1C] font-bold">
                                {t.customerName.charAt(0).toUpperCase()}
                              </div>
                           )}
                           {t.isAnonymous && (
                              <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white rounded-full p-0.5 border-2 border-white" title="Anonymous User">
                                 <EyeOff size={10} />
                              </div>
                           )}
                        </div>
                        
                        <div>
                          <p className="font-medium text-[#442D1C] flex items-center gap-2">
                            {t.customerName}
                          </p>
                          <p className="text-xs text-stone-500">{t.customerRole || "Customer"}</p>
                          
                          {t.isAnonymous && (
                             <span className="inline-flex items-center gap-1 text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 mt-1">
                                <EyeOff size={8} /> Hidden Publicly
                             </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-sm text-stone-600 line-clamp-2 italic">"{t.content}"</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full border border-stone-200">
                          {t.source}
                        </span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-6">
                      <div className="flex text-[#C85428]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < t.rating ? "fill-current" : "text-stone-300"} />
                        ))}
                      </div>
                    </td>

                    {/* Media */}
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {t.image && t.image.includes("http") && (
                           <a href={t.image} target="_blank" rel="noreferrer" className="relative group w-10 h-10 rounded-lg overflow-hidden border border-stone-200 block">
                             <img src={t.image} alt="Evidence" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                               <ImageIcon size={14} className="text-white" />
                             </div>
                           </a>
                        )}
                        {t.videoUrl && (
                          <a href={t.videoUrl} target="_blank" rel="noreferrer" className="relative group w-10 h-10 bg-black rounded-lg overflow-hidden border border-stone-200 flex items-center justify-center">
                            <Video size={16} className="text-white" />
                          </a>
                        )}
                        {!t.image?.includes("http") && !t.videoUrl && (
                          <span className="text-xs text-stone-400 italic">No media</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {t.approved ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <MessageSquare size={12} /> Pending
                        </span>
                      )}
                      {t.featured && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-[#C85428]/10 text-[#C85428] border border-[#C85428]/20">
                          <Star size={10} className="fill-current" /> Featured
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!t.approved ? (
                          <>
                            <button
                              onClick={() => handleApprove(t.id)}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                              title="Approve"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(t.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Reject"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleFeatured(t.id, t.featured)}
                              className={`p-2 rounded-lg transition-colors ${
                                t.featured 
                                  ? "bg-amber-100 text-amber-600" 
                                  : "bg-stone-100 text-stone-400 hover:text-amber-500"
                              }`}
                              title="Toggle Featured"
                            >
                              <Star size={16} className={t.featured ? "fill-current" : ""} />
                            </button>
                          </>
                        )}
                        
                        <div className="h-4 w-px bg-stone-200 mx-1"></div>

                        <button
                          onClick={() => setSelectedTestimonial(t)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-stone-400 hover:text-blue-600 transition-colors"
                          title="Edit Details"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#442D1C]">No testimonials found</h3>
            <p className="text-stone-500">
              {statusFilter === 'pending' ? "You're all caught up! No pending reviews." : "Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedTestimonial && (
        <TestimonialModal
          testimonial={selectedTestimonial}
          onClose={() => setSelectedTestimonial(null)}
          onSuccess={() => {
            fetchTestimonials();
            setSelectedTestimonial(null);
          }}
        />
      )}
    </div>
  );
}

// --- EDIT MODAL COMPONENT (WITH CLOUDINARY UPLOAD) ---
function TestimonialModal({ testimonial, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customerName: testimonial.customerName,
    customerRole: testimonial.customerRole || "",
    content: testimonial.content,
    rating: testimonial.rating,
    image: testimonial.image || "",
    videoUrl: testimonial.videoUrl || "",
    source: testimonial.source || "Website",
    approved: testimonial.approved,
    featured: testimonial.featured,
    isAnonymous: testimonial.isAnonymous || false,
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // CLOUDINARY UPLOAD HELPER
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image') setUploadingImage(true);
    else setUploadingVideo(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      // Ensure resource_type handles videos correctly if uploading video
      const resourceType = type === 'video' ? 'video' : 'image';

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        { method: 'POST', body: formData }
      );

      const data = await res.json();

      if (data.secure_url) {
        setFormData(prev => ({
          ...prev,
          [type === 'image' ? 'image' : 'videoUrl']: data.secure_url
        }));
        toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      if (type === 'image') setUploadingImage(false);
      else setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Updated successfully");
        onSuccess();
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-serif font-bold text-[#442D1C]">Edit Testimonial</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Customer Name</label>
              <input
                required
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#8E5022]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Role (Optional)</label>
              <input
                type="text"
                value={formData.customerRole}
                onChange={(e) => setFormData({ ...formData, customerRole: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#8E5022]/20 outline-none"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  <Star 
                    size={28} 
                    className={star <= formData.rating ? "fill-[#C85428] text-[#C85428]" : "text-stone-300"} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Review Content</label>
            <textarea
              required
              rows="4"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#8E5022]/20 outline-none"
            />
          </div>

          {/* CLOUDINARY UPLOAD SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
            
            {/* IMAGE UPLOAD */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Image</label>
              {formData.image ? (
                <div className="relative w-full h-32 rounded-lg border border-stone-300 bg-white overflow-hidden group">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, image: ""})}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <a 
                    href={formData.image} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="absolute bottom-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-black/70"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer bg-white hover:bg-stone-50 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    )}
                    <p className="text-xs text-stone-500">{uploadingImage ? 'Uploading...' : 'Click to upload image'}</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>

            {/* VIDEO UPLOAD */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Video</label>
              {formData.videoUrl ? (
                <div className="relative w-full h-32 rounded-lg border border-stone-300 bg-black overflow-hidden flex items-center justify-center group">
                  <Video className="w-8 h-8 text-white/50" />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, videoUrl: ""})}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                  >
                    <X size={14} />
                  </button>
                  <a 
                    href={formData.videoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="absolute bottom-2 right-2 p-1 bg-white/20 text-white rounded hover:bg-white/30 z-10"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer bg-white hover:bg-stone-50 transition-colors ${uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingVideo ? (
                      <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin mb-2" />
                    ) : (
                      <Video className="w-8 h-8 text-stone-400 mb-2" />
                    )}
                    <p className="text-xs text-stone-500">{uploadingVideo ? 'Uploading...' : 'Click to upload video'}</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={uploadingVideo}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <div className="flex flex-wrap gap-6">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={formData.approved}
                     onChange={(e) => setFormData({...formData, approved: e.target.checked})}
                     className="w-5 h-5 rounded text-[#442D1C] focus:ring-[#442D1C]"
                   />
                   <span className="text-sm font-medium text-stone-700">Approved</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={formData.featured}
                     onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                     className="w-5 h-5 rounded text-[#C85428] focus:ring-[#C85428]"
                   />
                   <span className="text-sm font-medium text-stone-700">Featured</span>
                 </label>
                 {/* ADMIN EDIT CONTROL FOR ANONYMITY */}
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={formData.isAnonymous}
                     onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                     className="w-5 h-5 rounded text-stone-800 focus:ring-stone-800"
                   />
                   <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
                      <EyeOff size={14} /> Anonymous
                   </span>
                 </label>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage || uploadingVideo}
                  className="px-6 py-2.5 rounded-lg bg-[#442D1C] text-white hover:bg-[#2B1B12] font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
}