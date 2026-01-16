"use client";

import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Search,
  Upload,
  Grid,
  List,
  Star,
  X,
  Image as ImageIcon,
  Loader2, // Added Loader2
  Plus, // Added Plus
  Check, // Added Check
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

// --- Configuration ---
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const GALLERY_CATEGORIES = [
  "PRODUCT",
  "WORKSHOP",
  "STUDIO",
  "EVENT",
  "PROCESS",
  "ARTISAN",
  "CUSTOMER",
];

export default function AdminGalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, [categoryFilter]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "100");
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const response = await fetch(`/api/gallery?${params.toString()}`);
      const data = await response.json();

      if (data.items) {
        setGalleryItems(data.items);
      } else {
        setGalleryItems([]);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      const response = await fetch(`/api/gallery/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Item deleted successfully");
        fetchGallery();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast.error("Network error");
    }
  };

  const toggleFeatured = async (itemId, currentlyFeatured) => {
    // Optimistic UI Update
    setGalleryItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, featured: !currentlyFeatured } : item
      )
    );

    try {
      const response = await fetch(`/api/gallery/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentlyFeatured }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          currentlyFeatured ? "Removed from featured" : "Added to featured"
        );
      } else {
        fetchGallery(); // Revert
        toast.error("Failed to update status");
      }
    } catch (error) {
      fetchGallery(); // Revert
      toast.error("Network error");
    }
  };

  const filteredItems = galleryItems.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#442D1C]">
              Gallery Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage photos and images across all categories
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-stone-700"
            >
              {viewMode === "grid" ? (
                <List className="w-5 h-5" />
              ) : (
                <Grid className="w-5 h-5" />
              )}
              {viewMode === "grid" ? "List View" : "Grid View"}
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors flex items-center gap-2 shadow-md"
            >
              <Upload className="w-5 h-5" />
              Upload Images
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-stone-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022] min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {GALLERY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchGallery}
                className="px-6 py-3 bg-[#442D1C] text-white rounded-xl font-medium hover:bg-[#2B1B12] transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Loader2 className="inline-block animate-spin text-[#8E5022] w-8 h-8" />
            <p className="mt-4 text-gray-600">Loading gallery items...</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <GalleryGridView
                items={filteredItems}
                onEdit={(item) => {
                  setSelectedItem(item);
                  setShowUploadModal(true);
                }}
                onDelete={handleDelete}
                onToggleFeatured={toggleFeatured}
              />
            ) : (
              <GalleryListView
                items={filteredItems}
                onEdit={(item) => {
                  setSelectedItem(item);
                  setShowUploadModal(true);
                }}
                onDelete={handleDelete}
                onToggleFeatured={toggleFeatured}
              />
            )}

            {filteredItems.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No items found
                </h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors mt-4"
                >
                  Add Your First Image
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <GalleryModal
            item={selectedItem}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedItem(null);
            }}
            onSuccess={() => {
              fetchGallery();
              setShowUploadModal(false);
              setSelectedItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub Components ---

function GalleryGridView({ items, onEdit, onDelete, onToggleFeatured }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-stone-100 group"
        >
          <div className="relative aspect-square">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-2">
              {item.featured && (
                <div className="bg-[#C85428] text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" />
                  FEATURED
                </div>
              )}
            </div>

            {/* Category */}
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white rounded-md text-xs font-medium">
                {item.category}
              </span>
            </div>

            {/* Action Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => onToggleFeatured(item.id, item.featured)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  item.featured
                    ? "bg-amber-400 text-white"
                    : "bg-white text-stone-600"
                }`}
                title={item.featured ? "Unfeature" : "Feature"}
              >
                <Star
                  className={`w-5 h-5 ${item.featured ? "fill-current" : ""}`}
                />
              </button>

              <button
                onClick={() => onEdit(item)}
                className="w-10 h-10 rounded-full bg-white text-stone-700 hover:text-[#8E5022] flex items-center justify-center transition-transform hover:scale-110"
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-transform hover:scale-110"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryListView({ items, onEdit, onDelete, onToggleFeatured }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                Image
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                Details
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                Category
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                Featured
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-stone-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover bg-stone-200"
                  />
                </td>
                <td className="py-4 px-6">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {item.description || "No description"}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium border border-stone-200">
                    {item.category}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => onToggleFeatured(item.id, item.featured)}
                    className={`p-2 rounded-full transition-colors ${
                      item.featured
                        ? "text-amber-500 bg-amber-50"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        item.featured ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GalleryModal({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    description: item?.description || "",
    image: item?.image || "",
    category: item?.category || "PRODUCT",
    featured: item?.featured || false,
    eventId: item?.eventId || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      alert("Please upload an image under 5MB.");
      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(10); // Start progress

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("folder", "basho-gallery"); // Specific folder for gallery

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      setUploadProgress(100);

      if (json.secure_url) {
        setFormData((prev) => ({
          ...prev,
          image: json.secure_url,
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed.");
    } finally {
      setUploadingImage(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = item ? `/api/gallery/${item.id}` : "/api/gallery";
      const method = item ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(item ? "Updated successfully" : "Created successfully");
        onSuccess();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#EDD8B4]"
      >
        <div className="p-5 border-b border-[#EDD8B4] flex items-center justify-between bg-[#FDFBF7] rounded-t-xl">
          <h2 className="font-serif text-xl font-bold text-[#442D1C]">
            {item ? "Edit Photo" : "Upload New Photo"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8E5022] hover:text-[#442D1C]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {/* Cloudinary Image Upload Section */}
          <section>
            <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2 mb-4">
              Image File
            </h3>
            <div className="relative aspect-video rounded-lg border border-[#EDD8B4] bg-[#FDFBF7] flex flex-col items-center justify-center overflow-hidden group">
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("replace-upload").click()
                      }
                      className="p-1.5 bg-white rounded-full text-[#8E5022] shadow-sm hover:bg-gray-100"
                      title="Replace Image"
                    >
                      <Edit className="w-4 h-4" />
                      <input
                        id="replace-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploadingImage}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          image: "",
                        }))
                      }
                      className="p-1.5 bg-white rounded-full text-red-500 shadow-sm hover:bg-gray-100"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-[#EDD8B4]/20 transition-colors">
                  {uploadProgress > 0 ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-[#C85428] animate-spin mb-2 mx-auto" />
                      <div className="text-xs font-bold text-[#C85428]">
                        Uploading {uploadProgress}%
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#8E5022] mb-2" />
                      <span className="text-sm font-medium text-[#8E5022]">
                        Click to Upload Image
                      </span>
                      <span className="text-xs text-[#8E5022]/60 mt-1">
                        Max 5MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
            {!formData.image && (
              <p className="text-xs text-red-500 mt-2">* Image is required</p>
            )}
          </section>

          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
              Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                  placeholder="e.g. Morning Light"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                >
                  {GALLERY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                  rows="3"
                  placeholder="Tell the story..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Associated Event ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.eventId}
                  onChange={(e) =>
                    setFormData({ ...formData, eventId: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                  placeholder="UUID of related event"
                />
              </div>
            </div>
          </section>

          {/* Flags */}
          <section className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  formData.featured
                    ? "bg-[#C85428] border-[#C85428]"
                    : "border-[#EDD8B4] bg-[#FDFBF7]"
                }`}
              >
                {formData.featured && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
              />
              <span className="text-sm font-medium text-[#442D1C]">
                Feature this photo in highlights
              </span>
            </label>
          </section>
        </form>

        <div className="p-5 border-t border-[#EDD8B4] bg-[#FDFBF7] rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.image}
            className="px-5 py-2.5 bg-[#442D1C] text-[#EDD8B4] rounded-lg font-bold hover:bg-[#652810] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </div>
            ) : item ? (
              "Save Changes"
            ) : (
              "Upload to Gallery"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
