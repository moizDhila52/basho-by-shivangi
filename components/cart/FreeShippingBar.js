"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";

export default function FreeShippingBar({ subtotal, threshold = 200 }) {
  const progress = Math.min((subtotal / threshold) * 100, 100);
  const remaining = threshold - subtotal;
  const isUnlocked = subtotal >= threshold;

  return (
    <div className="mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-100">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isUnlocked
              ? "bg-green-100 text-green-600"
              : "bg-[#EDD8B4]/40 text-[#8E5022]"
          }`}
        >
          <Truck className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#442D1C]">
            {isUnlocked ? (
              <span className="text-green-700">Free Shipping Unlocked!</span>
            ) : (
              <span>
                You're{" "}
                <span className="text-[#8E5022] font-bold">
                  ${remaining.toFixed(2)}
                </span>{" "}
                away from free shipping
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
        {/* Progress Bar Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            isUnlocked
              ? "bg-green-500"
              : "bg-gradient-to-r from-[#8E5022] to-[#C85428]"
          }`}
        />
      </div>
    </div>
  );
}