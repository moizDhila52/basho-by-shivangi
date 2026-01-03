// app/admin/gallery/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Upload,
  Grid,
  List,
  Star,
  X,
  CheckCircle,
  Image as ImageIcon,
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
      if (categoryFilter !== "all") params.append("category", categoryFilter);

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

  const handleDelete = async (itemId) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      const response = await fetch(`/api/gallery/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        fetchGallery();
        alert("Gallery item deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      alert("Failed to delete gallery item");
    }
  };

  const toggleFeatured = async (itemId, currentlyFeatured) => {
    try {
      const response = await fetch(`/api/gallery/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: !currentlyFeatured }),
      });

      const data = await response.json();

      if (data.success) {
        fetchGallery();
        alert(
          `Gallery item ${
            !currentlyFeatured ? "featured" : "unfeatured"
          } successfully`
        );
      }
    } catch (error) {
      console.error("Error updating gallery item:", error);
      alert("Failed to update gallery item");
    }
  };

  const filteredItems = galleryItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gallery Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage photos and images across all categories
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
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
              className="bg-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Images
            </button>
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
                  placeholder="Search gallery by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
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
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E5022]"></div>
            <p className="mt-4 text-gray-600">Loading gallery items...</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <GalleryGridView
                items={filteredItems}
                onEdit={setSelectedItem}
                onDelete={handleDelete}
                onToggleFeatured={toggleFeatured}
              />
            ) : (
              <GalleryListView
                items={filteredItems}
                onEdit={setSelectedItem}
                onDelete={handleDelete}
                onToggleFeatured={toggleFeatured}
              />
            )}

            {filteredItems.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No gallery items found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? "No items match your search criteria."
                    : "No gallery items have been added yet."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
                  >
                    Add Your First Image
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {(showUploadModal || selectedItem) && (
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
    </div>
  );
}

function GalleryGridView({ items, onEdit, onDelete, onToggleFeatured }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-square">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />

            {/* Featured Badge */}
            {item.featured && (
              <div className="absolute top-2 left-2">
                <div className="bg-[#C85428] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Featured
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-black/60 text-white rounded-full text-xs">
                {item.category}
              </span>
            </div>

            {/* Action Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => onToggleFeatured(item.id, item.featured)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.featured
                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
                title={item.featured ? "Unfeature" : "Feature"}
              >
                <Star
                  className={`w-5 h-5 ${item.featured ? "fill-current" : ""}`}
                />
              </button>

              <button
                onClick={() => onEdit(item)}
                className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="w-10 h-10 rounded-full bg-red-500/80 text-white hover:bg-red-600 flex items-center justify-center"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
            {item.Event && (
              <p className="text-xs text-gray-400 mt-2">
                From: {item.Event.title}
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
    <div className="bg-white rounded-2xl overflow-hidden">
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
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                </td>
                <td className="py-4 px-6">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.Event && (
                    <p className="text-xs text-gray-400 mt-2">
                      Event: {item.Event.title}
                    </p>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {item.category}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => onToggleFeatured(item.id, item.featured)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.featured
                        ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
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
                      className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = item ? `/api/gallery/${item.id}` : "/api/gallery";

      const method = item ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(item ? "Gallery item updated!" : "Gallery item created!");
        onSuccess();
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving gallery item:", error);
      alert("Failed to save gallery item");
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
              {item ? "Edit Gallery Item" : "Upload New Image"}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Image Preview & URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                required
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-3">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-48 h-48 rounded-xl object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                placeholder="Image title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                rows="3"
                placeholder="Optional description"
              />
            </div>

            {/* Category & Event */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                >
                  {GALLERY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Event (Optional)
                </label>
                <input
                  type="text"
                  value={formData.eventId}
                  onChange={(e) =>
                    setFormData({ ...formData, eventId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                  placeholder="Event ID"
                />
              </div>
            </div>

            {/* Featured Toggle */}
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
                Feature this image on gallery page
              </label>
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
                {loading ? "Saving..." : item ? "Update Item" : "Upload Image"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
