'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
  Heart,
  Truck,
  X,
  AlertTriangle,
  // 👇 UPDATED: Added new icons for trust badges
  ShieldCheck,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import RelatedProducts from '@/components/cart/RelatedProducts';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Custom Confirmation Dialog Component
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 border-b border-red-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl text-[#442D1C] mb-2">
                      {title}
                    </h3>
                    <p className="text-stone-600">{message}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    loading,
    isUpdating,
    moveToWishlist,
  } = useCart();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [settings, setSettings] = useState({
    shippingBaseRate: 50,
    shippingPerKgRate: 40,
    freeShippingThreshold: 5000,
    gstPercent: 12,
  });

  // Fetch Store Settings for Calculation
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  // --- Dynamic Calculation Logic ---
  const subtotal = getTotalPrice();

  console.log('--- DEBUG SHIPPING ---');
  cartItems.forEach((item) => {
    console.log(
      `Item: ${item.name}, Weight from DB: ${
        item.weight
      }, Fallback used? ${!item.weight}`,
    );
  });

  const totalWeight = cartItems.reduce((acc, item) => {
    return acc + (item.weight || 0.5) * item.quantity;
  }, 0);

  console.log('Total Calculated Weight:', totalWeight);
  let shippingCost = 0;

  if (totalWeight <= 1) {
    shippingCost = settings.shippingBaseRate;
  } else {
    const extraWeight = Math.ceil(totalWeight - 1);
    shippingCost =
      settings.shippingBaseRate + extraWeight * settings.shippingPerKgRate;
  }

  const tax = subtotal * (settings.gstPercent / 100);
  const total = subtotal + shippingCost + tax;

  const hasOutOfStockItems = cartItems.some(
    (item) => item.isOutOfStock || item.quantity > item.stock,
  );

  // Handle checkout
  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      router.push(`/login?returnUrl=/checkout`);
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (hasOutOfStockItems) {
      toast.error('Please remove out-of-stock items before checkout');
      return;
    }

    router.push('/checkout');
  };

  // Handle clear cart
  const handleClearCart = () => {
    clearCart();
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
          <p className="text-stone-600">Loading your cart...</p>
        </div>
      </main>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#FDFBF7]">
        {/* Back Button */}
        <div className="fixed top-24 left-4 md:top-28 md:left-8 z-30">
          <Link href="/products">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center justify-center bg-white/90 backdrop-blur-sm p-2.5 md:px-4 md:py-3 rounded-full shadow-md border border-stone-200"
            >
              <ArrowLeft className="w-5 h-5 text-[#442D1C]" />

              {/* Text is HIDDEN on mobile, visible on desktop (md) */}
              <span className="font-medium hidden md:inline ml-2 text-[#442D1C]">
                Back to Products
              </span>
            </motion.button>
          </Link>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 py-32 flex items-center justify-center min-h-screen">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-md w-full"
          >
            <motion.div
              variants={fadeInUp}
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8 rounded-full bg-gradient-to-br from-[#EDD8B4] to-[#C85428]/20 flex items-center justify-center"
            >
              <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-[#8E5022]" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-serif text-3xl md:text-5xl text-[#442D1C] mb-4"
            >
              Your cart is empty
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-stone-600 text-base md:text-lg mb-8"
            >
              Discover our handcrafted ceramics and add some beautiful pieces to
              your collection
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Link href="/products">
                <button className="bg-[#8E5022] text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-medium hover:bg-[#652810] transition-colors inline-flex items-center gap-3 w-full md:w-auto justify-center">
                  <ShoppingBag className="w-5 h-5" />
                  Browse Collections
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
            <p className="text-stone-600 font-medium">Updating cart...</p>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearCart}
        title="Clear Cart?"
        message={`Are you sure you want to remove all ${getTotalItems()} items from your cart?`}
      />

      {/* Main Content - Added pb-20 for mobile spacing */}
      <div className="max-w-7xl mx-auto px-4 py-24 md:py-28 pb-32">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <motion.div variants={fadeInUp} className="flex items-center gap-4">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-[#8E5022]" />
              <h1 className="font-serif text-3xl md:text-5xl text-[#442D1C]">
                Shopping Cart
              </h1>
            </motion.div>

            {/* Clear Cart Button */}
            <motion.button
              variants={fadeInUp}
              onClick={() => setShowClearDialog(true)}
              disabled={isUpdating}
              className="group flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Clear Cart</span>
            </motion.button>
          </div>

          <motion.p
            variants={fadeInUp}
            className="text-stone-600 text-base md:text-lg"
          >
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your
            cart
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Cart Items */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 space-y-4"
          >
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                custom={index}
                className={`bg-white rounded-3xl p-4 md:p-6 shadow-lg transition-all ${
                  item.isOutOfStock || item.quantity > item.stock
                    ? 'opacity-75 border-2 border-orange-100'
                    : 'hover:shadow-xl'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 relative">
                  {/* --- OOS OVERLAY & WISHLIST ACTION --- */}
                  {(item.isOutOfStock || item.quantity > item.stock) && (
                    <div className="absolute top-0 right-0 sm:right-14 z-20 flex flex-col items-end gap-2">
                      {/* 1. The Badge */}
                      <span className="bg-red-100 text-red-700 text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-3 h-3" />
                        {item.isOutOfStock
                          ? 'Out of Stock'
                          : `Only ${item.stock} left`}
                      </span>

                      {/* 2. The Move to Wishlist Button */}
                      <button
                        onClick={() => moveToWishlist(item)}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 bg-white border border-[#EDD8B4] px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm hover:bg-[#FDFBF7] transition-colors group/wish"
                      >
                        <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#8E5022] group-hover/wish:fill-[#8E5022] transition-colors" />
                        <span className="text-[10px] md:text-xs font-medium text-[#442D1C]">
                          Save
                        </span>
                      </button>
                    </div>
                  )}
                  {/* ----------------------------------- */}

                  {/* Product Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex-shrink-0 mx-auto sm:mx-0"
                  >
                    <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50 group cursor-pointer">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                          <Link href={`/products/${item.slug}`}>
                            <h3 className="font-serif text-xl md:text-2xl text-[#442D1C] mb-1 hover:text-[#C85428] transition-colors cursor-pointer truncate">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xs md:text-sm text-stone-500 uppercase tracking-wider">
                            {item.category}
                          </p>
                        </div>

                        {/* Remove Button (Desktop Position) */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={isUpdating}
                          className="hidden sm:flex ml-4 w-10 h-10 rounded-full bg-stone-100 hover:bg-red-50 items-center justify-center transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4 text-stone-400 group-hover:text-red-500 transition-colors" />
                        </button>
                      </div>

                      {/* Price and Stock */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-xl md:text-2xl text-[#8E5022]">
                            ₹{item.price.toFixed(2)}
                          </span>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <span className="text-stone-400 line-through text-xs md:text-sm">
                                ₹{item.originalPrice.toFixed(2)}
                              </span>
                            )}
                        </div>
                        {item.stock && (
                          <span
                            className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${
                              item.stock > 10
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {item.stock > 10
                              ? 'In Stock'
                              : `Only ${item.stock} left`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Mobile Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                      <div className="flex items-center border-2 border-stone-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={isUpdating}
                          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3 md:w-4 md:h-4 text-[#442D1C]" />
                        </button>
                        <span className="w-10 md:w-12 h-8 md:h-10 flex items-center justify-center font-medium text-sm md:text-base text-[#442D1C]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={isUpdating}
                          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4 text-[#442D1C]" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Remove Button (Mobile Only) */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={isUpdating}
                          className="sm:hidden w-8 h-8 rounded-full bg-stone-100 hover:bg-red-50 flex items-center justify-center transition-colors group disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-stone-400 group-hover:text-red-500 transition-colors" />
                        </button>

                        <div className="text-right">
                          <div className="text-xs text-stone-500 mb-0.5">
                            Subtotal
                          </div>
                          <div className="font-serif text-lg md:text-xl text-[#442D1C]">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Related Products Section */}
            <RelatedProducts
              cartItems={cartItems}
              onAdd={async (product) => {
                try {
                  await addToCart(product);
                  toast.success(`Added ${product.name} to cart`);
                  router.refresh();
                } catch (error) {
                  console.error('Error adding to cart:', error);
                  toast.error('Failed to add item. Please try again.');
                }
              }}
            />
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-serif text-2xl text-[#442D1C] mb-6">
                  Order Summary
                </h2>

                {/* Summary Items */}
                <div className="space-y-4 mb-6 text-sm md:text-base">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Tax ({settings.gstPercent}%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="pt-4 border-t-2 border-stone-200">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-medium text-[#442D1C]">
                        Total
                      </span>
                      <span className="font-serif text-2xl md:text-3xl text-[#442D1C]">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isUpdating || hasOutOfStockItems}
                  className={`w-full py-4 md:py-5 rounded-2xl font-medium text-base md:text-lg flex items-center justify-center gap-3 mb-4 transition-colors ${
                    isUpdating || hasOutOfStockItems
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-[#8E5022] text-white hover:bg-[#652810]'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : hasOutOfStockItems ? (
                    <>
                      Resolve Stock Issues
                      <AlertTriangle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <Link href="/products">
                  <button className="w-full bg-transparent border-2 border-stone-300 text-stone-700 py-4 md:py-5 rounded-2xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-colors">
                    Continue Shopping
                  </button>
                </Link>

                {/* Trust Badges - UPDATED SECTION */}
                <div className="mt-6 pt-6 border-t border-stone-200 space-y-3">
                  {/* Badge 1: Handcrafted (Kept) */}
                  <div className="flex items-center gap-3 text-xs md:text-sm text-stone-600">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#EDD8B4]/50 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#8E5022]" />
                    </div>
                    <span>Handcrafted with love</span>
                  </div>

                  {/* Badge 2: Secured Payment (New) */}
                  <div className="flex items-center gap-3 text-xs md:text-sm text-stone-600">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#EDD8B4]/50 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#8E5022]" />
                    </div>
                    <span>100% Secured Payment</span>
                  </div>

                  {/* Badge 3: Secure Packaging (New) */}
                  <div className="flex items-center gap-3 text-xs md:text-sm text-stone-600">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#EDD8B4]/50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#8E5022]" />
                    </div>
                    <span>Safe & Secure Packaging</span>
                  </div>
                </div>
              </div>

             
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
