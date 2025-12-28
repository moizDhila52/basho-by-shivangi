"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Fetch wishlist from API
const fetchWishlist = async () => {
  try {
    const response = await fetch("/api/wishlist", {
      credentials: "include",
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.wishlist || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

// Remove from wishlist API
const removeFromWishlistAPI = async (productId) => {
  try {
    const response = await fetch(
      `/api/wishlist/remove?productId=${productId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to remove from wishlist",
      };
    }

    return data;
  } catch (error) {
    console.error("Error in removeFromWishlistAPI:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToCart, updateQuantity, removeFromCart, cartItems, isUpdating } =
    useCart();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());

  // Load wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user && !authLoading) {
        router.push("/login?returnUrl=/wishlist");
        return;
      }

      if (user) {
        setLoading(true);
        try {
          const wishlistData = await fetchWishlist();
          setWishlistItems(wishlistData);
        } catch (error) {
          console.error("Error loading wishlist:", error);
          toast.error("Failed to load wishlist");
        } finally {
          setLoading(false);
        }
      }
    };

    loadWishlist();
  }, [user, authLoading, router]);

  // Remove from wishlist
  const handleRemoveFromWishlist = useCallback(async (productId) => {
    setRemovingItems((prev) => new Set([...prev, productId]));

    try {
      const result = await removeFromWishlistAPI(productId);

      if (result.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.productId !== productId)
        );
        toast.success("Removed from wishlist");
      } else {
        toast.error(result.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, []);

  // Add to cart handler
  const handleAddToCart = useCallback(
    (product) => {
      const cartProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || "/placeholder-image.jpg",
        inStock: product.inStock,
        category: product.Category?.name,
        quantity: 1,
      };

      addToCart(cartProduct);
      toast.success("Added to cart");
    },
    [addToCart]
  );

  // Update quantity handler
  const handleUpdateQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        updateQuantity(productId, quantity);
      }
    },
    [updateQuantity, removeFromCart]
  );

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
          <p className="text-stone-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/10 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-[#442D1C] mb-2">
                My Wishlist
              </h1>
              <p className="text-stone-600">
                {wishlistItems.length > 0
                  ? `${wishlistItems.length} ${
                      wishlistItems.length === 1 ? "item" : "items"
                    } saved for later`
                  : "Start building your collection"}
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <Link href="/products">
                <button className="bg-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#652810] transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  Continue Shopping
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#EDD8B4] to-[#C85428]/20 flex items-center justify-center">
              <Heart className="w-16 h-16 text-[#C85428]" />
            </div>
            <h2 className="font-serif text-3xl text-[#442D1C] mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Discover beautiful handcrafted ceramics and save your favorites
              for later
            </p>
            <Link href="/products">
              <button className="bg-[#8E5022] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#652810] transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                Explore Products
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {wishlistItems.map((item) => {
                const product = item.Product;
                const quantityInCart =
                  cartItems.find((cartItem) => cartItem.id === product.id)
                    ?.quantity || 0;
                const rating = product.averageRating || 0;
                const reviewCount = product._count?.Review || 0;
                const isRemoving = removingItems.has(product.id);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    variants={fadeInUp}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -8 }}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      disabled={isRemoving}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRemoving ? (
                        <Loader2 className="w-5 h-5 text-[#C85428] animate-spin" />
                      ) : (
                        <X className="w-5 h-5 text-stone-500 hover:text-red-500 transition-colors" />
                      )}
                    </button>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {product.isNew && (
                        <span className="bg-[#C85428] text-white text-xs font-medium px-3 py-1 rounded-full">
                          New
                        </span>
                      )}
                      {product.isBestseller && (
                        <span className="bg-[#442D1C] text-white text-xs font-medium px-3 py-1 rounded-full">
                          Bestseller
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="bg-stone-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Product Image */}
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative h-80 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 cursor-pointer">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100">
                            <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center">
                              <ShoppingBag className="w-10 h-10 text-stone-400" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-6">
                      <Link href={`/products/${product.slug}`}>
                        <div className="cursor-pointer">
                          <span className="text-sm text-[#8E5022] font-medium uppercase tracking-wider">
                            {product.Category?.name}
                          </span>
                          <h3 className="font-serif text-2xl text-[#442D1C] mt-1 mb-2 group-hover:text-[#C85428] transition-colors">
                            {product.name}
                          </h3>
                        </div>
                      </Link>

                      <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Rating */}
                      {reviewCount > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(rating)
                                    ? "fill-[#C85428] text-[#C85428]"
                                    : "text-stone-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-stone-500">
                            {rating.toFixed(1)} ({reviewCount})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-3xl text-[#442D1C]">
                            ₹{product.price.toFixed(2)}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="text-stone-400 line-through">
                                ₹{product.originalPrice.toFixed(2)}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {quantityInCart > 0 ? (
                          <div className="flex-1">
                            <div className="flex items-center justify-between bg-[#EDD8B4] rounded-xl p-1">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    product.id,
                                    quantityInCart - 1
                                  )
                                }
                                disabled={isUpdating}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4 text-[#442D1C]" />
                              </button>

                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-[#442D1C]" />
                                <span className="font-medium text-[#442D1C]">
                                  {quantityInCart}
                                </span>
                              </div>

                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={isUpdating}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4 text-[#442D1C]" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock || isUpdating}
                            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                              product.inStock
                                ? "bg-[#8E5022] text-white hover:bg-[#652810]"
                                : "bg-stone-200 text-stone-400 cursor-not-allowed"
                            } ${isUpdating ? "opacity-75" : ""}`}
                          >
                            <ShoppingBag className="w-5 h-5" />
                            {product.inStock ? "Add to Cart" : "Out of Stock"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
