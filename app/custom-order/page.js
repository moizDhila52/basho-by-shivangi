'use client';

import React, { useState, useCallback, useEffect } from 'react';

import { motion } from 'framer-motion';

import {
  Upload,
  Image as ImageIcon,
  Palette,
  Ruler,
  Droplets,
  Sparkles,
  Clock,
  Shield,
  CheckCircle,
  X,
  Plus,
  Minus,
  Send,
  Heart,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import Link from 'next/link';

import { useAuth } from '@/components/AuthProvider';

import toast from 'react-hot-toast';

// Brand Colors

const COLORS = {
  dark: '#442D1C',

  brown: '#652810',

  clay: '#8E5022',

  terracotta: '#C85428',

  cream: '#EDD8B4',

  background: '#FDFBF7',
};

// Animation Variants

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },

  visible: {
    opacity: 1,

    y: 0,

    transition: {
      duration: 0.8,

      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.15,

      delayChildren: 0.1,
    },
  },
};

// Material Options

const MATERIAL_OPTIONS = [
  { id: 'stoneware', name: 'Stoneware', color: '#8B7355' },

  { id: 'porcelain', name: 'Porcelain', color: '#F5F5F5' },

  { id: 'raku', name: 'Raku', color: '#5D4037' },

  { id: 'terracotta', name: 'Terracotta', color: '#C85428' },

  { id: 'earthenware', name: 'Earthenware', color: '#A0522D' },

  { id: 'unglazed', name: 'Unglazed Clay', color: '#8E5022' },
];

// Glaze Options

const GLAZE_OPTIONS = [
  { id: 'matt', name: 'Matt Finish' },

  { id: 'glossy', name: 'Glossy Finish' },

  { id: 'crackle', name: 'Crackle Glaze' },

  { id: 'celadon', name: 'Celadon' },

  { id: 'tenmoku', name: 'Tenmoku' },

  { id: 'shino', name: 'Shino' },

  { id: 'ash', name: 'Ash Glaze' },

  { id: 'cobalt', name: 'Cobalt Blue' },

  { id: 'copper', name: 'Copper Red' },
];

// Product Types

const PRODUCT_TYPES = [
  'Tea Bowl (Chawan)',

  'Coffee Mug',

  'Dinner Plate',

  'Salad Bowl',

  'Vase',

  'Jug/Pitcher',

  'Teapot',

  'Serving Bowl',

  'Sake Set',

  'Incense Holder',

  'Other',
];

// Mock custom orders for showcase

const PREVIOUS_CUSTOM_ORDERS = [
  {
    id: 1,

    title: 'Wedding Dinner Set',

    description: 'Custom 12-piece dinnerware set with gold leaf accents',

    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',

      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w-800&auto=format&fit=crop',
    ],

    material: 'Porcelain',

    glaze: 'Matt with Gold Leaf',

    timeline: '6 weeks',

    customer: 'Sarah & James',
  },

  {
    id: 2,

    title: 'Restaurant Tableware',

    description: 'Custom stoneware plates for farm-to-table restaurant',

    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',

      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w-800&auto=format&fit=crop',
    ],

    material: 'Stoneware',

    glaze: 'Ash Glaze',

    timeline: '8 weeks',

    customer: 'Farmhouse Kitchen',
  },

  {
    id: 3,

    title: 'Anniversary Vase',

    description: 'Hand-thrown vase with personalized inscription',

    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',

      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w-800&auto=format&fit=crop',
    ],

    material: 'Raku',

    glaze: 'Crackle Glaze',

    timeline: '4 weeks',

    customer: 'Michael R.',
  },
];

export default function CustomOrderPage() {
  const { user, loading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    productType: '',

    quantity: 1,

    material: '',

    glaze: '',

    dimensions: {
      height: '',

      width: '',

      depth: '',
    },

    colorPreferences: '',

    specialRequirements: '',

    deadline: '',

    budgetRange: '',

    contactName: '',

    contactEmail: '',

    contactPhone: '',

    notes: '',
  });

  const fileInputRef = React.useRef(null);

  // Auto-fill user data if logged in

  useEffect(() => {
    if (user && !authLoading) {
      setFormData((prev) => ({
        ...prev,

        contactName: user.name || '',

        contactEmail: user.email || '',

        contactPhone: user.phone || '',
      }));
    }
  }, [user, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData((prev) => ({
      ...prev,

      dimensions: {
        ...prev.dimensions,

        [dimension]: value,
      },
    }));
  };

  // --- UPDATED: Cloudinary Upload Function ---

  const uploadFile = async (file) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Missing Cloudinary configuration');
      }

      const formData = new FormData();

      formData.append('file', file);

      formData.append('upload_preset', uploadPreset);

      // Direct upload to Cloudinary API

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,

        {
          method: 'POST',

          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      // Cloudinary returns 'secure_url'

      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);

      toast.error(error.message || 'Failed to upload file');

      return null;
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    const newFiles = files.slice(0, 5 - uploadedFiles.length);

    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);

        continue;
      }

      // Show a loading toast or partial state if desired, but waiting is fine too

      const fileUrl = await uploadFile(file);

      if (fileUrl) {
        setUploadedFiles((prev) => [
          ...prev,

          {
            id: Date.now() + Math.random(),

            name: file.name,

            url: fileUrl,

            type: file.type,
          },
        ]);
      }
    }
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authLoading) {
      toast.error('Please wait while we verify your session');

      return;
    }

    if (!user) {
      toast.error('Please login to submit a custom order');

      return;
    }

    // Validation

    if (!formData.productType) {
      toast.error('Please select a product type');

      return;
    }

    if (!formData.material) {
      toast.error('Please select a material');

      return;
    }

    if (!formData.contactName || !formData.contactEmail) {
      toast.error('Please provide your contact information');

      return;
    }

    setIsSubmitting(true);

    try {
      // Extract just the URLs from uploadedFiles

      const fileUrls = uploadedFiles.map((file) => file.url);

      const orderData = {
        ...formData,

        files: fileUrls,

        submittedAt: new Date().toISOString(),
      };

      // Send to API

      const response = await fetch('/api/custom-orders', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      toast.success(
        "Custom order submitted successfully! We'll contact you within 24 hours.",
      );

      // Reset form

      setFormData({
        productType: '',

        quantity: 1,

        material: '',

        glaze: '',

        dimensions: {
          height: '',

          width: '',

          depth: '',
        },

        colorPreferences: '',

        specialRequirements: '',

        deadline: '',

        budgetRange: '',

        contactName: user?.name || '',

        contactEmail: user?.email || '',

        contactPhone: user?.phone || '',

        notes: '',
      });

      setUploadedFiles([]);
    } catch (error) {
      console.error('Error submitting custom order:', error);

      toast.error(error.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />

          <p className="text-stone-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* Hero Section */}

      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#8E5022]"
              style={{
                width: Math.random() * 80 + 20 + 'px',

                height: Math.random() * 80 + 20 + 'px',

                left: Math.random() * 100 + '%',

                top: Math.random() * 100 + '%',

                opacity: Math.random() * 0.2 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp}>
              <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
                Bespoke Ceramics
              </span>

              <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
                Create Your <br />
                <span className="text-[#C85428]">Dream Piece</span>
              </h1>

              <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                Commission a one-of-a-kind ceramic piece, crafted specifically
                for you by our master artisans.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}

      <section className="pb-32 px-4 pt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Form */}

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-8 h-8 text-[#8E5022]" />

                  <h2 className="font-serif text-3xl text-[#442D1C]">
                    Custom Order Request
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Product Type & Quantity */}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Product Type *
                      </label>

                      <select
                        name="productType"
                        value={formData.productType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                      >
                        <option value="">Select a product type</option>

                        {PRODUCT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Quantity
                      </label>

                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,

                              quantity: Math.max(1, prev.quantity - 1),
                            }))
                          }
                          className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                        >
                          <Minus className="w-5 h-5 text-stone-600" />
                        </button>

                        <div className="flex-1 text-center">
                          <span className="text-2xl font-medium text-[#442D1C]">
                            {formData.quantity}
                          </span>

                          <p className="text-sm text-stone-500 mt-1">
                            {formData.quantity === 1 ? 'piece' : 'pieces'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,

                              quantity: prev.quantity + 1,
                            }))
                          }
                          className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                        >
                          <Plus className="w-5 h-5 text-stone-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Material Selection */}

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">
                      Material *
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {MATERIAL_OPTIONS.map((material) => (
                        <button
                          key={material.id}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,

                              material: material.id,
                            }))
                          }
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            formData.material === material.id
                              ? 'border-[#8E5022] bg-[#FDFBF7]'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: material.color }}
                          />

                          <span className="text-sm font-medium">
                            {material.name}
                          </span>

                          {formData.material === material.id && (
                            <CheckCircle className="w-5 h-5 text-[#8E5022] mt-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glaze Options */}

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">
                      Glaze / Finish Preference
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {GLAZE_OPTIONS.map((glaze) => (
                        <button
                          key={glaze.id}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,

                              glaze: prev.glaze === glaze.id ? '' : glaze.id,
                            }))
                          }
                          className={`px-4 py-2 rounded-full border transition-all ${
                            formData.glaze === glaze.id
                              ? 'bg-[#8E5022] text-white border-[#8E5022]'
                              : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          {glaze.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions */}

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">
                      Dimensions (in cm)
                    </label>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">
                          Height
                        </label>

                        <input
                          type="number"
                          value={formData.dimensions.height}
                          onChange={(e) =>
                            handleDimensionChange('height', e.target.value)
                          }
                          placeholder="e.g., 15"
                          className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-stone-500 mb-1">
                          Width
                        </label>

                        <input
                          type="number"
                          value={formData.dimensions.width}
                          onChange={(e) =>
                            handleDimensionChange('width', e.target.value)
                          }
                          placeholder="e.g., 20"
                          className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-stone-500 mb-1">
                          Depth
                        </label>

                        <input
                          type="number"
                          value={formData.dimensions.depth}
                          onChange={(e) =>
                            handleDimensionChange('depth', e.target.value)
                          }
                          placeholder="e.g., 10"
                          className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Preferences */}

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Color Preferences
                    </label>

                    <textarea
                      name="colorPreferences"
                      value={formData.colorPreferences}
                      onChange={handleInputChange}
                      placeholder="Describe your preferred colors, patterns, or decorative elements..."
                      rows={3}
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                    />
                  </div>

                  {/* Reference Images */}

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">
                      Reference Images (Max 5, 5MB each)
                    </label>

                    <div className="space-y-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-3 border-dashed border-stone-300 rounded-2xl p-8 text-center cursor-pointer hover:border-[#8E5022] hover:bg-stone-50 transition-all"
                      >
                        <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />

                        <p className="text-stone-600 font-medium">
                          Click to upload images or drag and drop
                        </p>

                        <p className="text-sm text-stone-500 mt-2">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {/* Uploaded Files */}

                      {uploadedFiles.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {uploadedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="relative group rounded-xl overflow-hidden"
                            >
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-32 object-cover"
                              />

                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.id)}
                                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                  <X className="w-5 h-5 text-white" />
                                </button>
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="text-xs text-white truncate">
                                  {file.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requirements */}

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Special Requirements
                    </label>

                    <textarea
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      placeholder="Any special features, inscriptions, or functional requirements..."
                      rows={3}
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                    />
                  </div>

                  {/* Timeline & Budget - UPDATED CURRENCY */}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Desired Timeline
                      </label>

                      <input
                        type="text"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        placeholder="e.g., 6 weeks, by Christmas, etc."
                        className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Budget Range
                      </label>

                      <select
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                      >
                        <option value="">Select budget range</option>

                        <option value="under-1000">Under ₹1,000</option>

                        <option value="1000-5000">₹1,000 - ₹5,000</option>

                        <option value="5000-10000">₹5,000 - ₹10,000</option>

                        <option value="10000-20000">₹10,000 - ₹20,000</option>

                        <option value="over-20000">Over ₹20,000</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}

                  <div className="bg-[#FDFBF7] rounded-2xl p-6 border-2 border-[#EDD8B4]">
                    <h3 className="font-serif text-xl text-[#442D1C] mb-4">
                      Contact Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Name *
                        </label>

                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Email *
                        </label>

                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Phone
                        </label>

                        <input
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={(e) => {
                            // Only allow numbers

                            const value = e.target.value.replace(/\D/g, '');

                            setFormData((prev) => ({
                              ...prev,

                              contactPhone: value,
                            }));
                          }}
                          onKeyPress={(e) => {
                            // Prevent non-numeric characters from being entered

                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={15}
                          className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Additional Notes
                    </label>

                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any other details, inspiration, or questions..."
                      rows={4}
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                    />
                  </div>

                  {/* Submit Button */}

                  <div className="pt-6">
                    {!user ? (
                      <div className="text-center bg-[#FDFBF7] rounded-2xl p-8 border-2 border-[#EDD8B4]">
                        <AlertCircle className="w-12 h-12 text-[#8E5022] mx-auto mb-4" />

                        <h3 className="font-serif text-xl text-[#442D1C] mb-2">
                          Login Required
                        </h3>

                        <p className="text-stone-600 mb-6">
                          Please login to submit a custom order request
                        </p>

                        <Link
                          href={`/login?returnUrl=${encodeURIComponent(
                            '/custom-order',
                          )}`}
                          className="inline-block bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
                        >
                          Login to Continue
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white py-4 rounded-xl font-medium text-lg hover:shadow-2xl hover:shadow-[#C85428]/30 transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Custom Order Request
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Right Column - Info & Showcase */}

            <div className="space-y-8">
              {/* Process Info */}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-6 shadow-xl"
              >
                <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                  How It Works
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-[#8E5022]">1</span>
                    </div>

                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">
                        Submit Your Request
                      </h4>

                      <p className="text-sm text-stone-600">
                        Fill out the form with your requirements and inspiration
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-[#8E5022]">2</span>
                    </div>

                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">
                        Consultation & Quote
                      </h4>

                      <p className="text-sm text-stone-600">
                        We'll review your request and provide a detailed quote
                        within 48 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-[#8E5022]">3</span>
                    </div>

                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">
                        Design Approval
                      </h4>

                      <p className="text-sm text-stone-600">
                        We'll share sketches and samples for your approval
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-[#8E5022]">4</span>
                    </div>

                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">
                        Creation & Delivery
                      </h4>

                      <p className="text-sm text-stone-600">
                        Your piece is crafted and carefully shipped to you
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Features */}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#8E5022] to-[#652810] rounded-3xl p-6 text-white"
              >
                <h3 className="font-serif text-2xl mb-6">Why Choose Custom?</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />

                    <span className="font-medium">Truly Unique Piece</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5" />

                    <span className="font-medium">Personalized Design</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />

                    <span className="font-medium">Handcrafted Quality</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />

                    <span className="font-medium">Flexible Timeline</span>
                  </div>
                </div>
              </motion.div>

              {/* Previous Orders Showcase */}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                  Previous Custom Orders
                </h3>

                <div className="space-y-6">
                  {PREVIOUS_CUSTOM_ORDERS.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden mb-4">
                        <img
                          src={order.images[0]}
                          alt={order.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h4 className="font-serif text-lg text-[#442D1C] mb-2">
                        {order.title}
                      </h4>

                      <p className="text-sm text-stone-600 mb-3">
                        {order.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>{order.material}</span>

                        <span>{order.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}

      <section className="bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/20 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl text-[#442D1C] text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-medium text-[#442D1C] mb-2">
                How long does a custom order take?
              </h3>

              <p className="text-stone-600">
                Typically 4-8 weeks depending on complexity. Simple pieces may
                take less time, while complex sets or intricate designs may
                require more.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-medium text-[#442D1C] mb-2">
                Can I make changes after approval?
              </h3>

              <p className="text-stone-600">
                Minor changes can be made before production begins. Once the
                piece enters production, changes may not be possible or may
                incur additional costs.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-medium text-[#442D1C] mb-2">
                What's your return policy for custom orders?
              </h3>

              <p className="text-stone-600">
                Due to their personalized nature, custom orders are final and
                cannot be returned. However, we ensure satisfaction through our
                design approval process.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
