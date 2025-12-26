"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CartSlider from "@/components/CartSlider";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

// Local wishlist functions
const getLocalWishlist = () => {
  if (typeof window === "undefined") return [];
  const wishlist = localStorage.getItem("wishlist");
  return wishlist ? JSON.parse(wishlist) : [];
};

const saveLocalWishlist = (wishlist) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const productId = params.slug;
  const quantityInCart = product ? getItemQuantity(product.id) : 0;

  console.log("ProductDetailPage params:", params);
  console.log("params.slug:", params?.slug);

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to load product");
        }

        const data = await response.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (err) {
        console.error("Error loading product:", err);
        setError(err.message);
        toast.error(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Load wishlist
  useEffect(() => {
    if (user) {
      const wishlistData = getLocalWishlist();
      const userWishlist = wishlistData.filter(
        (item) => item.userId === (user.uid || user.id || user.email)
      );
      const wishlistSet = new Set(userWishlist.map((item) => item.productId));
      setWishlist(wishlistSet);
    } else {
      setWishlist(new Set());
    }
  }, [user]);

  // Toggle wishlist
  const toggleWishlist = useCallback(async () => {
    if (!product) return;

    if (!user) {
      toast.error("Please login to add to wishlist");
      router.push(`/login?returnUrl=/products/${productId}`);
      return;
    }

    if (authLoading) {
      return;
    }

    try {
      setWishlistLoading(true);

      const currentWishlist = getLocalWishlist();
      const isInWishlist = currentWishlist.some(
        (item) => item.productId === product.id
      );

      let updatedWishlist;
      let message = "";

      if (isInWishlist) {
        // Remove from wishlist
        updatedWishlist = currentWishlist.filter(
          (item) => item.productId !== product.id
        );
        message = "Removed from wishlist";
      } else {
        // Add to wishlist
        const wishlistItem = {
          productId: product.id,
          userId: user.uid || user.id || user.email,
          productName: product.name,
          productImage: product.images?.[0] || "",
          productPrice: product.price,
          productSlug: product.slug,
          createdAt: new Date().toISOString(),
        };

        updatedWishlist = [...currentWishlist, wishlistItem];
        message = "Added to wishlist";
      }

      // Save to localStorage
      saveLocalWishlist(updatedWishlist);

      // Update local state
      const wishlistSet = new Set(
        updatedWishlist.map((item) => item.productId)
      );
      setWishlist(wishlistSet);

      toast.success(message);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  }, [product, user, authLoading, router, productId]);

  // Image navigation
  const nextImage = () => {
    if (!product?.images) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
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
        image: product.images?.[0] || "/placeholder-image.jpg",
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
          <p className="text-stone-600 mb-6">{error || "Product not found"}</p>
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
      {/* Back Button */}
      <div className="fixed top-26 left-6 z-50">
        <Link href="/products">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Products</span>
          </motion.button>
        </Link>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Images */}
          <div className="relative">
            {/* Main Image */}
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
                      e.target.src = "/placeholder-image.jpg";
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
                        ? "ring-4 ring-[#8E5022] ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Category & Breadcrumb */}
            <div className="mb-6">
              <span className="text-[#8E5022] font-medium uppercase tracking-wider">
                {product.category?.name || "Uncategorized"}
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

            {/* Product Name */}
            <h1 className="font-serif text-5xl md:text-6xl text-[#442D1C] mb-6 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-8">
              {product.averageRating > 0 && (
                <>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.averageRating)
                            ? "fill-[#C85428] text-[#C85428]"
                            : "text-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-stone-600">
                    {product.averageRating.toFixed(1)} ({product.reviewCount}{" "}
                    reviews)
                  </span>
                  <span className="text-stone-500">•</span>
                </>
              )}
              <span
                className={`font-medium ${
                  product.inStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.inStock
                  ? product.stock > 10
                    ? "In Stock"
                    : `Only ${product.stock} left`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Product details if available */}
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

            {/* Price */}
            <div className="mb-8 p-8 bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/20 rounded-3xl">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-serif text-6xl text-[#442D1C]">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-2xl text-stone-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="bg-[#C85428] text-white text-sm font-medium px-4 py-1.5 rounded-full">
                        Save $
                        {(product.originalPrice - product.price).toFixed(2)}
                      </span>
                    </>
                  )}
              </div>
              <p className="text-stone-600 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {product.shipping || "Free shipping on orders over $200"}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <div className="text-sm text-stone-500 mb-3">Quantity</div>
              {quantityInCart > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="flex items-center border-2 border-[#EDD8B4] rounded-2xl overflow-hidden bg-[#EDD8B4]/20">
                    <button
                      onClick={() =>
                        updateQuantity(product.id, quantityInCart - 1)
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#EDD8B4]/40 transition-colors"
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
                      disabled={!product.inStock}
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#EDD8B4]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 text-[#442D1C]" />
                    </button>
                  </div>
                  <div className="text-stone-500">
                    {product.leadTime || "Ships in 3-5 business days"}
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
                    {product.leadTime || "Ships in 3-5 business days"}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {quantityInCart > 0 ? (
                <>
                  <button
                    onClick={() =>
                      updateQuantity(product.id, quantityInCart + quantity)
                    }
                    disabled={!product.inStock}
                    className="flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 bg-[#8E5022] text-white hover:bg-[#652810] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-6 h-6" />
                    Add {quantity} More
                  </button>
                  <Link href="/cart" className="flex-1">
                    <button className="w-full bg-transparent border-2 border-[#8E5022] text-[#8E5022] py-5 rounded-2xl font-medium text-lg hover:bg-[#8E5022]/10 transition-all flex items-center justify-center gap-3">
                      <ShoppingBag className="w-6 h-6" />
                      View Cart ({quantityInCart})
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  onClick={addToCartHandler}
                  disabled={!product.inStock}
                  className={`flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                    product.inStock
                      ? "bg-[#8E5022] text-white hover:bg-[#652810]"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-6 h-6" />
                  Add to Cart
                </button>
              )}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                  isInWishlist
                    ? "bg-[#FDFBF7] border-2 border-[#C85428] text-[#C85428]"
                    : "bg-[#FDFBF7] border-2 border-stone-300 text-stone-700 hover:border-[#C85428]"
                } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {wishlistLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Heart
                    className={`w-6 h-6 ${
                      isInWishlist ? "fill-[#C85428]" : ""
                    }`}
                  />
                )}
                {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            {/* Features */}
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

            {/* Care & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-2xl p-6">
                <h4 className="font-serif text-xl text-[#442D1C] mb-3">
                  Care Instructions
                </h4>
                <p className="text-stone-600">
                  {product.care || "Hand wash recommended with mild detergent."}
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

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mb-12">
                <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                  Customer Reviews
                </h3>
                <div className="space-y-6">
                  {product.reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-stone-200 pb-6"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(review.rating)
                                  ? "fill-[#C85428] text-[#C85428]"
                                  : "text-stone-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          {review.user?.name || "Anonymous"}
                        </span>
                        <span className="text-sm text-stone-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-stone-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
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
                      toast.success("Link copied to clipboard!");
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

        {/* Related Products */}
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
                          e.target.src = "/placeholder-image.jpg";
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

      {/* Cart Slider */}
      <CartSlider />
    </main>
  );
}
