'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Check,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Mail,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  X,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CartSlider from '@/components/CartSlider';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import NotifyButton from '@/components/NotifyButton';

// --- API Functions ---

const fetchWishlist = async () => {
  try {
    const response = await fetch('/api/wishlist', {
      credentials: 'include',
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.wishlist || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

const addToWishlistAPI = async (productId) => {
  try {
    const response = await fetch('/api/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to add to wishlist',
      };
    }

    return data;
  } catch (error) {
    console.error('Error in addToWishlistAPI:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

const removeFromWishlistAPI = async (productId) => {
  try {
    const response = await fetch(
      `/api/wishlist/remove?productId=${productId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to remove from wishlist',
      };
    }

    return data;
  } catch (error) {
    console.error('Error in removeFromWishlistAPI:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

// --- Review Form Component ---

function ReviewForm({ productSlug, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image Upload State
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle Cloudinary Upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit check
    if (images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    setUploading(true);
    const newImages = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append(
          'upload_preset',
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData },
        );
        const data = await res.json();
        if (data.secure_url) newImages.push(data.secure_url);
        else throw new Error('Upload failed');
      }
      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productSlug}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating,
          comment,
          images, // Send uploaded images
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      setImages([]);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-3xl p-8 mb-10 border border-stone-100">
      <h4 className="font-serif text-xl text-[#442D1C] mb-6">Write a Review</h4>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Your Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-[#C85428] text-[#C85428]'
                      : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-stone-600 font-medium">
                {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
              </span>
            )}
          </div>
        </div>

        {/* Comment Field */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-stone-700 mb-3"
          >
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience..."
            className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 outline-none transition-all resize-none"
            maxLength={500}
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Add Photos
          </label>
          <div className="flex flex-wrap gap-3">
            {/* Previews */}
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 group"
              >
                <img
                  src={img}
                  alt="Review"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {images.length < 5 && (
              <label
                className={`w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  uploading
                    ? 'border-[#8E5022] bg-amber-50'
                    : 'border-stone-300 hover:bg-stone-50 hover:border-stone-400'
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-[#8E5022] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-stone-400" />
                    <span className="text-[10px] text-stone-500 mt-1">
                      Upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !rating || uploading}
          className={`w-full py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
            submitting || !rating || uploading
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-[#8E5022] text-white hover:bg-[#652810]'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// --- Main Product Page ---

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToCart, updateQuantity, getItemQuantity, isUpdating } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Review & Lightbox States
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const productId = params.slug;
  const quantityInCart = product ? getItemQuantity(product.id) : 0;

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to load product');
        }

        const data = await response.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message);
        toast.error(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Check review eligibility
  // Check review eligibility
  useEffect(() => {
    async function checkReviewEligibility() {
      if (!user || !product) {
        setCanReview(false);
        return;
      }

      try {
        // 👇 FIX: Added timestamp and headers to bypass browser cache
        const response = await fetch(
          `/api/products/${productId}/review?_t=${new Date().getTime()}`,
          {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setReviewEligibility(data);
          setCanReview(data.canReview);
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setCanReview(false);
      }
    }

    checkReviewEligibility();
  }, [user, product, productId]);

  // Load wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        const wishlistData = await fetchWishlist();
        const wishlistSet = new Set(wishlistData.map((item) => item.productId));
        setWishlist(wishlistSet);
      } else {
        setWishlist(new Set());
      }
    };

    loadWishlist();
  }, [user]);

  // Toggle wishlist
  const toggleWishlist = useCallback(async () => {
    if (!product) return;

    if (authLoading) {
      toast.error('Please wait...');
      return;
    }

    if (!user) {
      toast.error('Please login to add to wishlist');
      router.push(`/login?returnUrl=/products/${productId}`);
      return;
    }

    setWishlistLoading(true);

    try {
      const isInWishlist = wishlist.has(product.id);

      if (isInWishlist) {
        const result = await removeFromWishlistAPI(product.id);
        if (result.success) {
          setWishlist((prev) => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
          toast.success('Removed from wishlist');
        } else {
          if (result.error && result.error !== 'Authentication required') {
            toast.error(result.error);
          } else if (!result.error) {
            toast.error('Failed to remove from wishlist');
          }
        }
      } else {
        const result = await addToWishlistAPI(product.id);
        if (result.success) {
          setWishlist((prev) => new Set([...prev, product.id]));
          toast.success('Added to wishlist');
        } else {
          if (result.error && result.error !== 'Authentication required') {
            toast.error(result.error);
          } else if (!result.error) {
            toast.error('Failed to add to wishlist');
          }
        }
      }
    } catch (err) {
      console.error('Error in toggleWishlist:', err);
      if (err.message !== 'Authentication required') {
        toast.error(err.message || 'Failed to update wishlist');
      }
    } finally {
      setWishlistLoading(false);
    }
  }, [product, user, authLoading, router, productId, wishlist]);

  // Callback to refresh product after review submission
  const handleReviewSubmitted = () => {
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data.product);
          setCanReview(false);
          setReviewEligibility({ ...reviewEligibility, hasReviewed: true });
        })
        .catch((err) => console.error('Error reloading product:', err));
    }
  };

  // Image navigation
  const nextImage = () => {
    if (!product?.images) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    );
  };

  // Add to cart
  const addToCartHandler = () => {
    if (!product) return;

    if (quantityInCart > 0) {
      updateQuantity(product.id, quantityInCart + quantity);
      toast.success(`Added ${quantity} more to cart`);
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || '/placeholder-image.jpg',
        inStock: product.inStock,
        category: product.category?.name,
        quantity: quantity,
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
          <p className="text-stone-600">Loading product...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-[#C85428] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-[#442D1C] mb-2">Oops!</h2>
          <p className="text-stone-600 mb-6">{error || 'Product not found'}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <button className="bg-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors">
                Browse Products
              </button>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="bg-transparent border-2 border-[#8E5022] text-[#8E5022] px-6 py-3 rounded-xl font-medium hover:bg-[#8E5022]/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isInWishlist = wishlist.has(product.id);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* 1. DELETE THE FIXED BUTTON BLOCK THAT WAS HERE */}

      {/* Product Content Wrapper */}
      {/* Changed py-24 to pt-24 pb-24 for explicit control */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-24">
        {/* 👇 NEW BACK BUTTON PLACEMENT 👇 */}
        <div className="mb-6">
          <Link href="/products" className="inline-block">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center justify-center gap-2 bg-white p-3 md:px-4 md:py-2.5 rounded-full shadow-sm hover:shadow-md text-[#442D1C] transition-all"
            >
              <ArrowLeft size={20} />
              {/* Text hidden on mobile, visible on desktop */}
              <span className="hidden md:block font-serif font-medium text-sm">
                Back to Products
              </span>
            </motion.button>
          </Link>
        </div>
        {/* 👆 END NEW BUTTON 👆 */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Images */}
          <div className="relative">
            {product.images && product.images.length > 0 ? (
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-[600px] rounded-3xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50"
              >
                <div className="w-full h-full relative">
                  <img
                    src={product.images[selectedImage]}
                    alt={`${product.name} - View ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Badges */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-[#C85428] text-white text-sm font-medium px-4 py-2 rounded-full">
                      New Arrival
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="bg-[#442D1C] text-white text-sm font-medium px-4 py-2 rounded-full">
                      Bestseller
                    </span>
                  )}
                  {!product.inStock && (
                    <span className="bg-stone-600 text-white text-sm font-medium px-4 py-2 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="relative h-[600px] rounded-3xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-16 h-16 text-stone-400" />
                  </div>
                  <p className="text-stone-500">No images available</p>
                </div>
              </div>
            )}

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto p-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'ring-4 ring-[#8E5022] ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div>
            <div className="mb-6">
              <span className="text-[#8E5022] font-medium uppercase tracking-wider">
                {product.category?.name || 'Uncategorized'}
              </span>
              <div className="flex items-center gap-2 text-sm text-stone-500 mt-2">
                <Link
                  href="/products"
                  className="hover:text-[#8E5022] transition-colors"
                >
                  Products
                </Link>
                <span>/</span>
                {product.category && (
                  <>
                    <Link
                      href={`/products?category=${product.category.slug}`}
                      className="hover:text-[#8E5022] transition-colors"
                    >
                      {product.category.name}
                    </Link>
                    <span>/</span>
                  </>
                )}
                <span className="text-stone-800">{product.name}</span>
              </div>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl text-[#442D1C] mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              {product.averageRating > 0 && (
                <>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.averageRating)
                            ? 'fill-[#C85428] text-[#C85428]'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-stone-600">
                    {product.averageRating.toFixed(1)} ({product.reviewCount}{' '}
                    reviews)
                  </span>
                  <span className="text-stone-500">•</span>
                </>
              )}
              <span
                className={`font-medium ${
                  product.inStock ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.inStock
                  ? product.stock > 10
                    ? 'In Stock'
                    : `Only ${product.stock} left`
                  : 'Out of Stock'}
              </span>
            </div>

            <p className="text-stone-600 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {product.material || product.dimensions || product.color ? (
              <div className="grid grid-cols-2 gap-6 mb-10">
                {product.material && (
                  <div className="space-y-2">
                    <div className="text-sm text-stone-500">Material</div>
                    <div className="font-medium text-lg">
                      {product.material}
                    </div>
                  </div>
                )}
                {product.dimensions && (
                  <div className="space-y-2">
                    <div className="text-sm text-stone-500">Dimensions</div>
                    <div className="font-medium text-lg">
                      {product.dimensions}
                    </div>
                  </div>
                )}
                {product.color && (
                  <div className="space-y-2">
                    <div className="text-sm text-stone-500">Color</div>
                    <div className="font-medium text-lg">{product.color}</div>
                  </div>
                )}
                {product.leadTime && (
                  <div className="space-y-2">
                    <div className="text-sm text-stone-500">Lead Time</div>
                    <div className="font-medium text-lg">
                      {product.leadTime}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mb-8 p-8 bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/20 rounded-3xl">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-serif text-6xl text-[#442D1C]">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-2xl text-stone-400 line-through">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                      <span className="bg-[#C85428] text-white text-sm font-medium px-4 py-1.5 rounded-full">
                        Save ₹
                        {(product.originalPrice - product.price).toFixed(2)}
                      </span>
                    </>
                  )}
              </div>
              <p className="text-stone-600 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {product.shipping || 'Free shipping on orders over $200'}
              </p>
            </div>

            <div className="mb-8">
              <div className="text-sm text-stone-500 mb-3">Quantity</div>
              {quantityInCart > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="flex items-center border-2 border-[#EDD8B4] rounded-2xl overflow-hidden bg-[#EDD8B4]/20">
                    <button
                      onClick={() =>
                        updateQuantity(product.id, quantityInCart - 1)
                      }
                      disabled={!product.inStock || isUpdating}
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#EDD8B4]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4 text-[#442D1C]" />
                    </button>
                    <div className="w-12 h-12 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-[#8E5022]" />
                        <span className="font-medium text-lg">
                          {quantityInCart}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500">in cart</div>
                    </div>
                    <button
                      onClick={() =>
                        updateQuantity(product.id, quantityInCart + 1)
                      }
                      disabled={!product.inStock || isUpdating}
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#EDD8B4]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 text-[#442D1C]" />
                    </button>
                  </div>
                  <div className="text-stone-500">
                    {product.leadTime || 'Ships in 3-5 business days'}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-stone-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center font-medium text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.inStock}
                      className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-stone-500">
                    {product.leadTime || 'Ships in 3-5 business days'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {quantityInCart > 0 ? (
                <>
                  <button
                    onClick={() =>
                      updateQuantity(product.id, quantityInCart + quantity)
                    }
                    disabled={!product.inStock || isUpdating}
                    className="flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 bg-[#8E5022] text-white hover:bg-[#652810] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6" />
                        Add {quantity} More
                      </>
                    )}
                  </button>
                  <Link href="/cart" className="flex-1">
                    <button
                      disabled={isUpdating}
                      className="w-full bg-transparent border-2 border-[#8E5022] text-[#8E5022] py-5 rounded-2xl font-medium text-lg hover:bg-[#8E5022]/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-6 h-6" />
                      View Cart ({quantityInCart})
                    </button>
                  </Link>
                </>
              ) : !product.inStock ? (
                <div className="flex-1">
                  <NotifyButton productId={product.id} stock={product.stock} />
                </div>
              ) : (
                <button
                  onClick={addToCartHandler}
                  disabled={isUpdating}
                  className="flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 bg-[#8E5022] text-white hover:bg-[#652810]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-6 h-6" />
                      Add to Cart
                    </>
                  )}
                </button>
              )}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading || isUpdating}
                className={`flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                  isInWishlist
                    ? 'bg-[#FDFBF7] border-2 border-[#C85428] text-[#C85428]'
                    : 'bg-[#FDFBF7] border-2 border-stone-300 text-stone-700 hover:border-[#C85428]'
                } ${
                  wishlistLoading || isUpdating
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {wishlistLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Heart
                    className={`w-6 h-6 ${
                      isInWishlist ? 'fill-[#C85428]' : ''
                    }`}
                  />
                )}
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-12">
                <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                  Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-stone-600"
                    >
                      <Check className="w-5 h-5 text-[#8E5022]" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-2xl p-6">
                <h4 className="font-serif text-xl text-[#442D1C] mb-3">
                  Care Instructions
                </h4>
                <p className="text-stone-600">
                  {product.care || 'Hand wash recommended with mild detergent.'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-[#8E5022]" />
                  <h4 className="font-serif text-xl text-[#442D1C]">
                    Guarantee
                  </h4>
                </div>
                <p className="text-stone-600 mb-3">30-day return policy</p>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <RefreshCw className="w-4 h-4" />
                  Easy returns & exchanges
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                Customer Reviews
              </h3>

              {user && canReview && (
                <ReviewForm
                  productSlug={productId}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              )}

              {user && reviewEligibility?.hasReviewed && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-800 font-medium">
                      You have already reviewed this product. Thank you for your
                      feedback!
                    </p>
                  </div>
                </div>
              )}

              {user &&
                reviewEligibility?.hasPurchased &&
                !reviewEligibility?.isDelivered &&
                !reviewEligibility?.hasReviewed && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <p className="text-blue-800 font-medium">
                        Your order is on the way! You can review this product
                        once it is delivered.
                      </p>
                    </div>
                  </div>
                )}

              {user && reviewEligibility && !reviewEligibility.hasPurchased && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800 font-medium">
                      Purchase this product to leave a review
                    </p>
                  </div>
                </div>
              )}

              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-stone-200 pb-6 last:border-0"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-[#EDD8B4] rounded-full flex items-center justify-center text-[#442D1C] font-serif font-bold text-lg border-2 border-transparent hover:border-[#C85428] transition-all">
                          {review.User?.name
                            ? review.User.name[0].toUpperCase()
                            : review.User?.email
                            ? review.User.email[0].toUpperCase()
                            : 'A'}
                        </div>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(review.rating)
                                  ? 'fill-[#C85428] text-[#C85428]'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          {review.User?.name || 'Anonymous'}
                        </span>
                        {review.isVerified && (
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                        <span className="text-sm text-stone-500 ml-auto">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-stone-600 ml-14">{review.comment}</p>
                      )}

                      {/* --- REVIEW IMAGES (Myntra Style Display) --- */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-4 ml-14">
                          {review.images.slice(0, 3).map((img, index) => {
                            const isLastVisible = index === 2;
                            const remainingCount = review.images.length - 3;

                            // If this is the 3rd image AND there are more hidden
                            if (isLastVisible && remainingCount > 0) {
                              return (
                                <div
                                  key={index}
                                  onClick={() => {
                                    setLightboxImages(review.images);
                                    setLightboxIndex(index);
                                  }}
                                  className="relative w-24 h-24 rounded-xl overflow-hidden cursor-pointer"
                                >
                                  <img
                                    src={img}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">
                                      +{remainingCount}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            // Standard Image Display
                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  setLightboxImages(review.images);
                                  setLightboxIndex(index);
                                }}
                                className="w-24 h-24 rounded-xl overflow-hidden border border-stone-200 cursor-pointer hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={img}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* --- End Review Images --- */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-stone-50 rounded-2xl">
                  <Star className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 mb-2">No reviews yet</p>
                  <p className="text-sm text-stone-400">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-serif text-xl text-[#442D1C] mb-4">
                Share this piece
              </h4>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                  className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <Mail className="w-5 h-5 text-stone-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <h2 className="font-serif text-4xl text-[#442D1C] mb-12 text-center">
              You may also <span className="text-[#C85428]">like</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      {!relatedProduct.inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-stone-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-sm text-[#8E5022] font-medium uppercase tracking-wider">
                        {relatedProduct.category}
                      </span>
                      <h3 className="font-serif text-2xl text-[#442D1C] mt-2 mb-3 group-hover:text-[#C85428] transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl text-[#442D1C]">
                          ${relatedProduct.price.toFixed(2)}
                        </span>
                        {relatedProduct.originalPrice &&
                          relatedProduct.originalPrice >
                            relatedProduct.price && (
                            <span className="text-stone-400 line-through">
                              ${relatedProduct.originalPrice.toFixed(2)}
                            </span>
                          )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {lightboxImages && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col justify-center items-center backdrop-blur-md">
            <button
              onClick={() => setLightboxImages(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            >
              <X size={32} />
            </button>

            <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center">
              <img
                src={lightboxImages[lightboxIndex]}
                alt="Review Fullscreen"
                className="max-h-full max-w-full object-contain"
              />
              {/* Nav Buttons */}
              {lightboxImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(
                        (prev) =>
                          (prev - 1 + lightboxImages.length) %
                          lightboxImages.length,
                      );
                    }}
                    className="absolute left-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(
                        (prev) => (prev + 1) % lightboxImages.length,
                      );
                    }}
                    className="absolute right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Strip */}
            <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-full px-4">
              {lightboxImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    lightboxIndex === idx
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60'
                  }`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`thumbnail-${idx}`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      <CartSlider />
    </main>
  );
}
