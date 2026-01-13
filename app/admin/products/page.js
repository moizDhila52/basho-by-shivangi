"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Edit2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Upload,
  Check,
  X,
  Loader2,
  Package,
  Tag,
  Grid,
  List,
  MoreHorizontal,
  Mail, // Imported Mail icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration ---
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function AdminProductsPage() {
  // --- State ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("list"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // --- Form State ---
  const initialFormState = {
    name: "",
    weight: "0.5", 
    price: "",
    description: "",
    categoryId: "",
    stock: "0",
    material: "",
    features: [],
    isFeatured: false,
    isBestseller: false,
    isNew: false,
    images: [""],
    originalPrice: "",
    dimensions: "",
    color: "",
    care: "",
    leadTime: "",
    metaTitle: "",
    metaDescription: "",
    sendNewsletter: false, // <--- ADDED THIS
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Derived State ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // --- Handlers ---

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      alert("Please upload an image under 5MB.");
      return;
    }

    try {
      setUploadingImages(true);
      setUploadProgress((prev) => ({ ...prev, [index]: 10 }));

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("folder", "basho-products");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      setUploadProgress((prev) => ({ ...prev, [index]: 100 }));

      if (json.secure_url) {
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img, i) =>
            i === index ? json.secure_url : img
          ),
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    } finally {
      setUploadingImages(false);
      setTimeout(
        () =>
          setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
          }),
        1000
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      // Clean data
      const payload = {
        ...formData,
        features: formData.features.filter((f) => f.trim() !== ""),
        images: formData.images.filter((i) => i.trim() !== ""),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Operation failed");

      const savedProduct = await res.json();

      if (editingProduct) {
        setProducts(
          products.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        );
      } else {
        setProducts([savedProduct, ...products]);
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert("Failed to save product.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product permanently?")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        selectedProducts.delete(id);
      }
    } catch (error) {
      alert("Failed to delete.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedProducts.size} products?`)) return;
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedProducts) }),
      });
      if (res.ok) {
        setProducts(products.filter((p) => !selectedProducts.has(p.id)));
        setSelectedProducts(new Set());
      }
    } catch (error) {
      alert("Bulk delete failed.");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ...initialFormState,
      ...product,
      features: product.features || [],
      images: product.images?.length ? product.images : [""],
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      sendNewsletter: false, // Default to false when opening edit
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  // --- Render Helpers ---

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C85428] animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ... (Header and Filters Code - Unchanged) ... */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
            Products
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Manage catalog • {products.length} items
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-5 py-2.5 rounded-lg font-medium hover:bg-[#652810] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]" />
            <input
              type="text"
              placeholder="Search by name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none cursor-pointer min-w-[150px]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022] pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {selectedProducts.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedProducts.size})
            </button>
          )}

          <div className="flex bg-[#FDFBF7] p-1 rounded-lg border border-[#EDD8B4]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow text-[#C85428]"
                  : "text-[#8E5022]"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow text-[#C85428]"
                  : "text-[#8E5022]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* ... (Table and Grid Views - Unchanged) ... */}
       {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EDD8B4] p-12 text-center">
          <Package className="w-12 h-12 text-[#EDD8B4] mx-auto mb-3" />
          <h3 className="text-[#442D1C] font-medium">No products found</h3>
          <p className="text-[#8E5022]/60 text-sm mt-1">
            Try adjusting your filters.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white group rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                selectedProducts.has(product.id)
                  ? "border-[#C85428] ring-1 ring-[#C85428]"
                  : "border-[#EDD8B4]"
              }`}
            >
              <div className="aspect-square relative bg-[#FDFBF7] overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#EDD8B4]">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => {
                      const newSet = new Set(selectedProducts);
                      if (newSet.has(product.id)) newSet.delete(product.id);
                      else newSet.add(product.id);
                      setSelectedProducts(newSet);
                    }}
                    className="w-5 h-5 rounded border-[#EDD8B4] text-[#C85428] focus:ring-[#C85428] cursor-pointer"
                  />
                </div>
                {product.stock <= 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-xs text-center py-1 font-medium backdrop-blur-sm">
                    Out of Stock
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-serif font-bold text-[#442D1C] truncate flex-1">
                    {product.name}
                  </h3>
                  <p className="font-medium text-[#C85428]">₹{product.price}</p>
                </div>
                <p className="text-xs text-[#8E5022] mb-3 truncate">
                  {product.Category?.name || "Uncategorized"}
                </p>

                <div className="flex gap-2 border-t border-[#EDD8B4]/30 pt-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 py-1.5 rounded-md bg-[#FDFBF7] border border-[#EDD8B4] text-[#442D1C] text-xs font-medium hover:bg-[#EDD8B4]/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View (Table)
        <div className="bg-white rounded-xl border border-[#EDD8B4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#EDD8B4] text-xs uppercase tracking-wider text-[#8E5022] font-semibold">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      onChange={() =>
                        setSelectedProducts(
                          selectedProducts.size === filteredProducts.length
                            ? new Set()
                            : new Set(filteredProducts.map((p) => p.id))
                        )
                      }
                      checked={
                        selectedProducts.size === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      className="rounded border-[#EDD8B4] text-[#C85428] focus:ring-[#C85428]"
                    />
                  </th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDD8B4]/30 text-sm text-[#442D1C]">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FDFBF7]/50 transition-colors group"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => {
                          const newSet = new Set(selectedProducts);
                          if (newSet.has(product.id)) newSet.delete(product.id);
                          else newSet.add(product.id);
                          setSelectedProducts(newSet);
                        }}
                        className="rounded border-[#EDD8B4] text-[#C85428] focus:ring-[#C85428]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FDFBF7] border border-[#EDD8B4] overflow-hidden flex-shrink-0">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-[#8E5022] truncate">
                            {product.stock} in stock
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#8E5022]">
                      {product.Category?.name || "-"}
                    </td>
                    <td className="p-4">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          OOS
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium">₹{product.price}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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
      )}

      {/* --- FORM MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#EDD8B4]"
            >
              <div className="p-5 border-b border-[#EDD8B4] flex items-center justify-between bg-[#FDFBF7] rounded-t-xl">
                <h2 className="font-serif text-xl font-bold text-[#442D1C]">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-[#8E5022] hover:text-[#442D1C]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto p-6 space-y-8 custom-scrollbar"
              >
                {/* 1. Basic Info */}
                <section className="space-y-4">
                  <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                    Basic Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Product Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                        placeholder="e.g. Kintsugi Bowl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                      >
                        <option value="">Select...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Description
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* 2. Inventory & Pricing */}
                <section className="space-y-4">
                  <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                    Inventory & Pricing
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Price (₹) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Original Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originalPrice: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Stock Qty *
                      </label>
                      <input
                        required
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Weight (Kg) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                        placeholder="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Lead Time
                      </label>
                      <input
                        type="text"
                        value={formData.leadTime}
                        onChange={(e) =>
                          setFormData({ ...formData, leadTime: e.target.value })
                        }
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                        placeholder="e.g. 2-3 days"
                      />
                    </div>
                  </div>
                </section>

                {/* 3. Media */}
                <section className="space-y-4">
                  <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                    Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg border border-[#EDD8B4] bg-[#FDFBF7] flex flex-col items-center justify-center overflow-hidden group"
                      >
                        {img ? (
                          <>
                            <img
                              src={img}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  images: prev.images.filter(
                                    (_, idx) => idx !== i
                                  ),
                                }))
                              }
                              className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-[#EDD8B4]/20 transition-colors">
                            {uploadProgress[i] ? (
                              <div className="text-xs font-bold text-[#C85428]">
                                {uploadProgress[i]}%
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-[#8E5022] mb-1" />
                                <span className="text-xs text-[#8E5022]">
                                  Upload
                                </span>
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, i)}
                              disabled={uploadingImages}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                    {formData.images.length < 5 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            images: [...prev.images, ""],
                          }))
                        }
                        className="aspect-square rounded-lg border-2 border-dashed border-[#EDD8B4] flex flex-col items-center justify-center text-[#8E5022] hover:border-[#C85428] hover:text-[#C85428] transition-colors"
                      >
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold">Add Slot</span>
                      </button>
                    )}
                  </div>
                </section>

                {/* 4. Specifications */}
                <section className="space-y-4">
                  <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                    Attributes
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Material (e.g. Stoneware)"
                      value={formData.material}
                      onChange={(e) =>
                        setFormData({ ...formData, material: e.target.value })
                      }
                      className="p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Dimensions"
                      value={formData.dimensions}
                      onChange={(e) =>
                        setFormData({ ...formData, dimensions: e.target.value })
                      }
                      className="p-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg"
                    />
                  </div>

                  {/* Features Array */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-[#8E5022] uppercase">
                        Product Features
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            features: [...prev.features, ""],
                          }))
                        }
                        className="text-xs text-[#C85428] font-bold flex items-center hover:underline"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Feature
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.length === 0 && (
                        <p className="text-xs text-[#8E5022]/50 italic">
                          No features added.
                        </p>
                      )}
                      {formData.features.map((feat, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const newFeats = [...formData.features];
                              newFeats[i] = e.target.value;
                              setFormData({ ...formData, features: newFeats });
                            }}
                            className="flex-1 p-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm"
                            placeholder="e.g. Dishwasher Safe"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                features: prev.features.filter(
                                  (_, idx) => idx !== i
                                ),
                              }))
                            }
                            className="text-red-500 hover:bg-red-50 p-2 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 5. Flags */}
                <section className="flex flex-wrap gap-6 pt-2">
                  {[
                    { key: "isFeatured", label: "Featured" },
                    { key: "isBestseller", label: "Bestseller" },
                    { key: "isNew", label: "New Arrival" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          formData[key]
                            ? "bg-[#C85428] border-[#C85428]"
                            : "border-[#EDD8B4] bg-[#FDFBF7]"
                        }`}
                      >
                        {formData[key] && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData[key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: e.target.checked })
                        }
                      />
                      <span className="text-sm font-medium text-[#442D1C]">
                        {label}
                      </span>
                    </label>
                  ))}
                </section>

                {/* 6. NEWSLETTER NOTIFICATION (NEW) */}
                <section className="pt-4 border-t border-[#EDD8B4]">
                     <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-[#C85428]/30 bg-[#C85428]/5 hover:bg-[#C85428]/10 transition-colors">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                            formData.sendNewsletter
                            ? "bg-[#C85428] border-[#C85428]"
                            : "border-[#C85428] bg-white"
                        }`}>
                            {formData.sendNewsletter && (
                                <Check className="w-3.5 h-3.5 text-white" />
                            )}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.sendNewsletter}
                            onChange={(e) => setFormData({...formData, sendNewsletter: e.target.checked})}
                        />
                        <div className="flex-1">
                            <span className="flex items-center gap-2 font-bold text-[#442D1C] text-sm">
                                <Mail className="w-4 h-4 text-[#C85428]"/> Notify Subscribers
                            </span>
                            <span className="block text-xs text-[#8E5022] mt-0.5">
                                Automatically send a "New Arrival" or "Back in Stock" email to all newsletter subscribers when you save this product.
                            </span>
                        </div>
                     </label>
                </section>

              </form>

              <div className="p-5 border-t border-[#EDD8B4] bg-[#FDFBF7] rounded-b-xl flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-[#442D1C] text-[#EDD8B4] rounded-lg font-bold hover:bg-[#652810] shadow-md transition-colors"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}