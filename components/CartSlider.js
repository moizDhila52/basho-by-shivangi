"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
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
        className="fixed bottom-8 right-8 z-40 bg-[#8E5022] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center"
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
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white z-50 shadow-2xl"
            >
              {/* Loading Overlay - INSIDE the cart panel */}
              {isUpdating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[60]">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
                    <p className="text-sm text-stone-600">Updating cart...</p>
                  </div>
                </div>
              )}

              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-stone-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-[#8E5022]" />
                      <h2 className="font-serif text-2xl text-[#442D1C]">
                        Your Cart
                      </h2>
                      {getTotalItems() > 0 && (
                        <span className="bg-[#C85428] text-white text-sm px-3 py-1 rounded-full">
                          {getTotalItems()} items
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loading ? (
                    // Loading state while fetching cart
                    <div className="h-full flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin mb-4" />
                      <p className="text-stone-600">Loading cart...</p>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                        <ShoppingBag className="w-12 h-12 text-stone-400" />
                      </div>
                      <h3 className="font-serif text-2xl text-[#442D1C] mb-4">
                        Your cart is empty
                      </h3>
                      <p className="text-stone-600 mb-8">
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
                    <div className="space-y-6">
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex gap-4 p-4 bg-stone-50 rounded-2xl"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-stone-100">
                                <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center">
                                  <ShoppingBag className="w-10 h-10 text-stone-400" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-[#442D1C]">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-stone-500">
                                  {item.category}
                                </p>
                                <p className="font-medium text-[#8E5022] mt-1">
                                  ${item.price}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                disabled={isUpdating}
                                className="text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  disabled={isUpdating}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 h-8 flex items-center justify-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  disabled={isUpdating}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="font-serif text-lg text-[#442D1C]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && !loading && (
                  <div className="border-t border-stone-200 p-6">
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          ${getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Shipping</span>
                        <span className="font-medium">
                          {getTotalPrice() > 200 ? "Free" : "$15.00"}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-medium text-[#442D1C] pt-4 border-t">
                        <span>Total</span>
                        <span>
                          $
                          {(
                            getTotalPrice() + (getTotalPrice() > 200 ? 0 : 15)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link href="/checkout">
                        <button
                          onClick={() => setIsCartOpen(false)}
                          disabled={isUpdating}
                          className="w-full bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Proceed to Checkout
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </Link>
                      <div></div>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-full bg-transparent border-2 border-stone-300 text-stone-700 py-4 rounded-xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
