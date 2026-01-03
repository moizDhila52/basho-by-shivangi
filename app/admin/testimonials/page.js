// app/admin/testimonials/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Star,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Video,
  User,
} from "lucide-react";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, [statusFilter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      // Note: We need a separate admin endpoint for pending testimonials
      // For now, we'll use the public endpoint
      const response = await fetch(
        `/api/testimonials?approved=${statusFilter === "approved"}`
      );
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

  const handleApprove = async (testimonialId) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: true }),
      });

      const data = await response.json();

      if (data.success) {
        fetchTestimonials();
        alert("Testimonial approved successfully");
      }
    } catch (error) {
      console.error("Error approving testimonial:", error);
      alert("Failed to approve testimonial");
    }
  };

  const handleReject = async (testimonialId) => {
    if (!confirm("Are you sure you want to reject this testimonial?")) return;

    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: false, isActive: false }),
      });

      const data = await response.json();

      if (data.success) {
        fetchTestimonials();
        alert("Testimonial rejected successfully");
      }
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      alert("Failed to reject testimonial");
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchTestimonials();
        alert("Testimonial deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial");
    }
  };

  const toggleFeatured = async (testimonialId, currentlyFeatured) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: !currentlyFeatured }),
      });

      const data = await response.json();

      if (data.success) {
        fetchTestimonials();
        alert(
          `Testimonial ${
            !currentlyFeatured ? "featured" : "unfeatured"
          } successfully`
        );
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      alert("Failed to update testimonial");
    }
  };

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.customerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Testimonials Management
            </h1>
            <p className="text-gray-600 mt-1">
              Review, approve, and manage customer testimonials
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {testimonials.filter((t) => !t.approved).length} pending review
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search testimonials by name, content, or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="all">All Testimonials</option>
              </select>

              <button
                onClick={fetchTestimonials}
                className="px-6 py-3 bg-[#442D1C] text-white rounded-xl font-medium hover:bg-[#2B1B12] transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E5022]"></div>
              <p className="mt-4 text-gray-600">Loading testimonials...</p>
            </div>
          ) : filteredTestimonials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Testimonial
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Rating
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Source
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTestimonials.map((testimonial) => (
                    <tr
                      key={testimonial.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {testimonial.image ? (
                            <img
                              src={testimonial.image}
                              alt={testimonial.customerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EDD8B4] to-[#C85428] flex items-center justify-center text-white">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {testimonial.customerName}
                            </h4>
                            {testimonial.customerRole && (
                              <p className="text-xs text-gray-500">
                                {testimonial.customerRole}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="text-gray-600 line-clamp-2">
                          {testimonial.content}
                        </p>
                        {testimonial.Product && (
                          <p className="text-xs text-gray-400 mt-1">
                            Product: {testimonial.Product.name}
                          </p>
                        )}
                        {testimonial.videoUrl && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                            <Video className="w-3 h-3" />
                            Video testimonial
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(testimonial.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            {testimonial.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          {testimonial.source || "Website"}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                            testimonial.approved
                              ? "bg-green-100 text-green-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {testimonial.approved ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Approved
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4" />
                              Pending
                            </>
                          )}
                        </div>
                        {testimonial.featured && testimonial.approved && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[#C85428]/10 text-[#C85428] mt-2">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {!testimonial.approved ? (
                            <>
                              <button
                                onClick={() => handleApprove(testimonial.id)}
                                className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                                title="Approve"
                              >
                                <ThumbsUp className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(testimonial.id)}
                                className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                                title="Reject"
                              >
                                <ThumbsDown className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  toggleFeatured(
                                    testimonial.id,
                                    testimonial.featured
                                  )
                                }
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  testimonial.featured
                                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                                title={
                                  testimonial.featured ? "Unfeature" : "Feature"
                                }
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    testimonial.featured ? "fill-current" : ""
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedTestimonial(testimonial)
                                }
                                className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(testimonial.id)}
                            className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No testimonials found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {statusFilter === "pending"
                  ? "No testimonials pending review. Great work!"
                  : "No testimonials match your filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Testimonial Modal */}
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
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Testimonial updated successfully!");
        onSuccess();
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      alert("Failed to update testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Testimonial
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Role
                </label>
                <input
                  type="text"
                  value={formData.customerRole}
                  onChange={(e) =>
                    setFormData({ ...formData, customerRole: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                  placeholder="e.g., Art Collector, Workshop Participant"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-2xl focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-4 text-gray-600">{formData.rating}/5</span>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testimonial Content *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                rows="4"
              />
            </div>

            {/* Media */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Source & Status */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                >
                  <option value="Website">Website</option>
                  <option value="Google">Google</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="approved"
                    checked={formData.approved}
                    onChange={(e) =>
                      setFormData({ ...formData, approved: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-[#8E5022] focus:ring-[#8E5022]"
                  />
                  <label
                    htmlFor="approved"
                    className="text-sm font-medium text-gray-700"
                  >
                    Approved for display
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-[#8E5022] focus:ring-[#8E5022]"
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium text-gray-700"
                  >
                    Featured testimonial
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#8E5022] text-white rounded-xl font-medium hover:bg-[#652810] transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : "Update Testimonial"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
