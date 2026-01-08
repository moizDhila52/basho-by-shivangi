"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Edit2,
  Eye,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  Upload,
  Check,
  X,
  Loader2,
  Package,
  Tag,
  DollarSign,
  BarChart3,
  Grid,
  List,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Bashō Color Palette
const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    name: "",
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
  });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products?include=category"),
        fetch("/api/admin/categories"),
      ]);

      if (!productsRes.ok || !categoriesRes.ok)
        throw new Error("Failed to fetch");

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products based on search and category
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

  // Handle Create/Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";

      const method = editingProduct ? "PUT" : "POST";

      // Prepare data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        features: formData.features.filter((f) => f.trim() !== ""),
        images: formData.images.filter((img) => img.trim() !== ""),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Failed to save product");

      const savedProduct = await res.json();

      // Update local state
      if (editingProduct) {
        setProducts(
          products.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        );
      } else {
        setProducts([savedProduct, ...products]);
      }

      // Reset form
      resetForm();

      // Show success message
      alert(
        editingProduct
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      // Remove from local state
      setProducts(products.filter((p) => p.id !== id));
      setSelectedProducts((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      alert("No products selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.size} products?`
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedProducts) }),
      });

      if (!res.ok) throw new Error("Bulk delete failed");

      // Update local state
      setProducts(products.filter((p) => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());

      alert(`${selectedProducts.size} products deleted successfully!`);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      alert("Failed to delete selected products");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      price: product.price?.toString() || "",
      description: product.description || "",
      categoryId: product.categoryId || "",
      stock: product.stock?.toString() || "0",
      material: product.material || "",
      features: product.features || [],
      isFeatured: product.isFeatured || false,
      isBestseller: product.isBestseller || false,
      isNew: product.isNew || false,
      images: product.images?.length > 0 ? product.images : [""],
      originalPrice: product.originalPrice?.toString() || "",
      dimensions: product.dimensions || "",
      color: product.color || "",
      care: product.care || "",
      leadTime: product.leadTime || "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
    });
    setIsFormOpen(true);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", "basho-products");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      return data.secure_url; // Return the uploaded image URL
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Update the handleFileChange function
  const handleFileChange = async (e, index) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert("File size should be less than 5MB");
      return;
    }

    try {
      setUploadingImages(true);
      setUploadProgress((prev) => ({ ...prev, [index]: 0 }));

      // Show upload progress (simulated)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          if (newProgress[index] < 90) {
            newProgress[index] += 10;
          }
          return newProgress;
        });
      }, 100);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [index]: 100 }));

      // Update form data with the new image URL
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => (i === index ? imageUrl : img)),
      }));

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        });
      }, 1000);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };
  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
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
    });
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  // Toggle product selection
  const toggleProductSelection = (id) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all products
  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // Add feature field
  const addFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  // Update feature
  const updateFeature = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  // Remove feature
  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Add image field
  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  // Update image
  const updateImage = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }));
  };

  // Remove image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-[#C85428] rounded-full mx-auto mb-4"
          />
          <p className="text-[#8E5022] font-serif">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
            Product Catalog
          </h1>
          <p className="text-[#8E5022] mt-1">
            Manage your artisan ceramics collection ({products.length} products)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white px-4 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-2xl border border-[#EDD8B4] shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E5022]" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] w-full transition-all text-[#442D1C]"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] text-[#442D1C] cursor-pointer min-w-[180px]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8E5022] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#EDD8B4]/20 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-[#C85428]"
                    : "text-[#8E5022] hover:text-[#C85428]"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-[#C85428]"
                    : "text-[#8E5022] hover:text-[#C85428]"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8E5022]">
                  {selectedProducts.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:shadow transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#EDD8B4] bg-gradient-to-r from-[#FDFBF7] to-white">
                <h2 className="font-serif text-2xl font-bold text-[#442D1C]">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg hover:bg-[#EDD8B4]/20 transition-colors"
                >
                  <X className="w-5 h-5 text-[#8E5022]" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto max-h-[calc(90vh-80px)]"
              >
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8E5022] mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                          placeholder="e.g., Hand-Thrown Ceramic Vase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#8E5022] mb-2">
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
                          className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C] appearance-none"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8E5022] mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#8E5022] mb-2">
                          Original Price (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              originalPrice: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                          placeholder="For discounts"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#8E5022] mb-2">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({ ...formData, stock: e.target.value })
                          }
                          className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#8E5022] mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C] min-h-[100px]"
                        placeholder="Describe the product in detail..."
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#442D1C]">
                        Product Images
                      </h3>
                      <button
                        type="button"
                        onClick={addImageField}
                        className="flex items-center gap-1 text-sm text-[#C85428] hover:text-[#8E5022]"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Image
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center gap-3">
                            {/* Image Preview */}
                            {image && (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#EDD8B4] bg-[#FDFBF7]">
                                <img
                                  src={image}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {uploadProgress[index] !== undefined &&
                                  uploadProgress[index] < 100 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <div className="text-white text-xs font-medium">
                                        {uploadProgress[index]}%
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}

                            {/* Upload Section */}
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-[#8E5022] mb-2">
                                Image {index + 1}
                              </label>
                              <div className="flex items-center gap-3">
                                <label className="flex-1">
                                  <div
                                    className={`relative cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all hover:border-[#C85428] hover:bg-[#FDFBF7] ${
                                      image
                                        ? "border-green-200 bg-green-50"
                                        : "border-[#EDD8B4] bg-[#FDFBF7]"
                                    }`}
                                  >
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleFileChange(e, index)
                                      }
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      disabled={uploadingImages}
                                    />
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-center gap-2">
                                        <Upload
                                          className={`w-5 h-5 ${
                                            image
                                              ? "text-green-500"
                                              : "text-[#8E5022]"
                                          }`}
                                        />
                                        <span
                                          className={`font-medium ${
                                            image
                                              ? "text-green-600"
                                              : "text-[#8E5022]"
                                          }`}
                                        >
                                          {image
                                            ? "Replace Image"
                                            : "Upload Image"}
                                        </span>
                                      </div>
                                      <p className="text-xs text-[#8E5022]/60">
                                        Click to upload (JPG, PNG, WebP) • Max
                                        5MB
                                      </p>
                                      {uploadProgress[index] !== undefined &&
                                        uploadProgress[index] < 100 && (
                                          <div className="w-full bg-[#EDD8B4] rounded-full h-2 overflow-hidden">
                                            <div
                                              className="bg-gradient-to-r from-[#C85428] to-[#8E5022] h-full transition-all duration-300"
                                              style={{
                                                width: `${uploadProgress[index]}%`,
                                              }}
                                            ></div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </label>

                                {/* Image URL Display (Read-only) */}
                                {image && (
                                  <div className="flex-1">
                                    <div className="text-xs text-[#8E5022] mb-1">
                                      Uploaded Image URL:
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg">
                                      <input
                                        type="text"
                                        value={image}
                                        readOnly
                                        className="flex-1 bg-transparent border-none outline-none text-xs text-[#442D1C] truncate"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigator.clipboard.writeText(image)
                                        }
                                        className="p-1 text-[#8E5022] hover:text-[#C85428] hover:bg-[#EDD8B4]/20 rounded"
                                        title="Copy URL"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                  disabled={
                                    formData.images.length === 1 ||
                                    uploadingImages
                                  }
                                  title="Remove image"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Drag & Drop Note (only for first image) */}
                          {index === 0 && !image && (
                            <div className="text-xs text-[#8E5022]/60 italic">
                              Tip: You can also drag and drop image files
                              directly onto the upload area
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#442D1C]">
                        Product Features
                      </h3>
                      <button
                        type="button"
                        onClick={addFeatureField}
                        className="flex items-center gap-1 text-sm text-[#C85428] hover:text-[#8E5022]"
                      >
                        <Plus className="w-4 h-4" />
                        Add Feature
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) =>
                              updateFeature(index, e.target.value)
                            }
                            placeholder="e.g., Dishwasher Safe, Microwave Safe"
                            className="flex-1 p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8E5022] mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        value={formData.material}
                        onChange={(e) =>
                          setFormData({ ...formData, material: e.target.value })
                        }
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                        placeholder="e.g., Stoneware, Porcelain"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#8E5022] mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                        placeholder="e.g., Terracotta, Cream"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#8E5022] mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                        placeholder="e.g., 10x8x6 inches"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#8E5022] mb-2">
                        Lead Time
                      </label>
                      <input
                        type="text"
                        value={formData.leadTime}
                        onChange={(e) =>
                          setFormData({ ...formData, leadTime: e.target.value })
                        }
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                        placeholder="e.g., 2-3 weeks"
                      />
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="space-y-3">
                    <h3 className="font-serif text-lg font-bold text-[#442D1C]">
                      Product Flags
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isFeatured: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-[#C85428] rounded focus:ring-[#C85428] border-[#EDD8B4]"
                        />
                        <span className="text-[#442D1C]">Featured Product</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isBestseller}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isBestseller: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-[#C85428] rounded focus:ring-[#C85428] border-[#EDD8B4]"
                        />
                        <span className="text-[#442D1C]">Bestseller</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNew}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isNew: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-[#C85428] rounded focus:ring-[#C85428] border-[#EDD8B4]"
                        />
                        <span className="text-[#442D1C]">New Arrival</span>
                      </label>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                      SEO & Meta Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[#8E5022] mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={formData.metaTitle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              metaTitle: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C]"
                          placeholder="SEO title for search engines"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#8E5022] mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={formData.metaDescription}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              metaDescription: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent text-[#442D1C] min-h-[80px]"
                          placeholder="SEO description for search engines"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between p-6 border-t border-[#EDD8B4] bg-[#FDFBF7]">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 border border-[#EDD8B4] text-[#8E5022] rounded-xl hover:bg-[#EDD8B4]/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List/Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-[#EDD8B4] p-12 text-center"
        >
          <Package className="w-16 h-16 text-[#EDD8B4] mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-2">
            No products found
          </h3>
          <p className="text-[#8E5022] mb-6">
            Try adjusting your search or add a new product
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Your First Product
          </button>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 ${
                selectedProducts.has(product.id)
                  ? "border-[#C85428] ring-2 ring-[#C85428]/20"
                  : "border-[#EDD8B4]"
              }`}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-b from-[#EDD8B4] to-[#FDFBF7] overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[#EDD8B4]" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {product.isNew && (
                    <span className="px-2 py-1 bg-[#C85428] text-white text-xs font-medium rounded-full">
                      New
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="px-2 py-1 bg-[#442D1C] text-white text-xs font-medium rounded-full">
                      Bestseller
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="px-2 py-1 bg-[#8E5022] text-white text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Selection Checkbox */}
                <div className="absolute top-3 right-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="w-5 h-5 rounded border-[#EDD8B4] text-[#C85428] focus:ring-[#C85428]"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-bold text-[#442D1C] line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#8E5022] mt-1">
                      {product.category?.name || "Uncategorized"}
                    </p>
                  </div>
                  <span className="font-bold text-[#442D1C] text-lg">
                    ₹{product.price}
                  </span>
                </div>

                <p className="text-sm text-[#442D1C]/70 line-clamp-2 min-h-[40px]">
                  {product.description}
                </p>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-[#EDD8B4]/30">
                  <div className="text-center">
                    <div className="text-xs text-[#8E5022]">Stock</div>
                    <div
                      className={`font-bold ${
                        product.stock > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.stock}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#8E5022]">Material</div>
                    <div className="font-medium text-[#442D1C] text-sm">
                      {product.material || "-"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#8E5022]">Color</div>
                    <div className="font-medium text-[#442D1C] text-sm">
                      {product.color || "-"}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 py-2 bg-[#EDD8B4] text-[#8E5022] rounded-lg font-medium hover:bg-[#EDD8B4]/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={isDeleting === product.id}
                    className="flex-1 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        /* List View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#EDD8B4] overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/30 border-b border-[#EDD8B4]">
                  <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.size === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[#EDD8B4] text-[#C85428] focus:ring-[#C85428]"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                    Product
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                    Category
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                    Price
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                    Stock
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDD8B4]/30">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FDFBF7] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 rounded border-[#EDD8B4] text-[#C85428] focus:ring-[#C85428]"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-b from-[#EDD8B4] to-[#FDFBF7] rounded-lg overflow-hidden flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#EDD8B4]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#442D1C]">
                            {product.name}
                          </div>
                          <div className="text-sm text-[#8E5022] line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EDD8B4]/20 text-[#8E5022] rounded-full text-sm">
                        <Tag className="w-3 h-3" />
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#442D1C]">
                        ₹{product.price}
                      </div>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <div className="text-sm text-[#8E5022] line-through">
                            ₹{product.originalPrice}
                          </div>
                        )}
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className={`font-bold ${
                          product.stock > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {product.stock}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {product.isNew && (
                          <span className="px-2 py-1 bg-[#C85428]/10 text-[#C85428] text-xs rounded-full">
                            New
                          </span>
                        )}
                        {product.isBestseller && (
                          <span className="px-2 py-1 bg-[#442D1C]/10 text-[#442D1C] text-xs rounded-full">
                            Bestseller
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="px-2 py-1 bg-[#8E5022]/10 text-[#8E5022] text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-[#8E5022] hover:text-[#C85428] hover:bg-[#EDD8B4]/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isDeleting === product.id}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="p-2 text-[#8E5022] hover:text-[#442D1C] hover:bg-[#EDD8B4]/20 rounded-lg transition-colors"
                          title="View Details"
                          onClick={() =>
                            window.open(`/products/${product.slug}`, "_blank")
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
