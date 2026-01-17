"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartSlider() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    isUpdating,
    loading,
    setIsCartOpen,
  } = useCart();

  // --- Dynamic Calculation State (Mirrored from cart/page.js) ---
  const [settings, setSettings] = useState({
    shippingBaseRate: 50,
    shippingPerKgRate: 40,
    freeShippingThreshold: 5000,
    gstPercent: 12,
  });

  // Fetch Store Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load settings");
      }
    };
    if (isCartOpen) fetchSettings();
  }, [isCartOpen]);

  // Calculation Logic
  const subtotal = getTotalPrice();

  const totalWeight = cartItems.reduce((acc, item) => {
    return acc + (item.weight || 0.5) * item.quantity;
  }, 0);

  let shippingCost = 0;
  if (cartItems.length > 0) {
    if (totalWeight <= 1) {
      shippingCost = settings.shippingBaseRate;
    } else {
      const extraWeight = Math.ceil(totalWeight - 1);
      shippingCost =
        settings.shippingBaseRate + extraWeight * settings.shippingPerKgRate;
    }
  }

  // Apply Free Shipping Threshold if subtotal exceeds it
  if (subtotal >= settings.freeShippingThreshold) {
    shippingCost = 0;
  }

  const tax = subtotal * (settings.gstPercent / 100);
  const total = subtotal + shippingCost + tax;

  const slideVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <>
      {/* Cart Toggle Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-[#8E5022] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {getTotalItems() > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-[#C85428] text-xs rounded-full flex items-center justify-center"
            >
              {getTotalItems()}
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Cart Slider */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Cart Panel */}
            <motion.div
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Loading Overlay */}
              {isUpdating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[60]">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
                    <p className="text-sm text-stone-600 font-medium">Updating cart...</p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="p-4 md:p-6 border-b border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-[#8E5022]" />
                    <h2 className="font-serif text-xl md:text-2xl text-[#442D1C]">
                      Your Cart
                    </h2>
                    {getTotalItems() > 0 && (
                      <span className="bg-[#C85428] text-white text-xs px-2.5 py-1 rounded-full">
                        {getTotalItems()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-500" />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin mb-4" />
                    <p className="text-stone-600">Loading cart...</p>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-stone-400" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-[#442D1C] mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-stone-500 mb-8 text-sm md:text-base px-6">
                      Add some beautiful ceramics to get started
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4 p-3 md:p-4 bg-stone-50 rounded-2xl border border-stone-100"
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-stone-200">
                          <img
                            src={item.image || "/placeholder-image.jpg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="truncate">
                              <h4 className="font-medium text-[#442D1C] text-sm md:text-base truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs text-stone-500 uppercase tracking-tight">
                                {item.category}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={isUpdating}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-stone-50 transition-colors disabled:opacity-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={isUpdating}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-stone-50 transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="font-serif text-sm md:text-base text-[#8E5022] font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && !loading && (
                <div className="border-t border-stone-200 p-4 md:p-6 bg-white space-y-4">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm text-stone-600">
                      <span>Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4" /> Shipping
                      </span>
                      <span className="font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600">
                      <span>Tax ({settings.gstPercent}%)</span>
                      <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base md:text-lg font-bold text-[#442D1C] pt-3 border-t">
                      <span>Total</span>
                      <span className="font-serif">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <Link href="/checkout" className="w-full">
                      <button
                        onClick={() => setIsCartOpen(false)}
                        disabled={isUpdating}
                        className="w-full bg-[#8E5022] text-white py-3.5 md:py-4 rounded-xl font-medium hover:bg-[#652810] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </Link>
                    <Link href="/cart" className="w-full">
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-full bg-transparent border-2 border-stone-200 text-stone-700 py-3 md:py-4 rounded-xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-colors"
                      >
                        View Full Cart
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}