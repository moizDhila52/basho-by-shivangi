'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ArrowRight,
  Package,
  ShoppingBag,
  Home,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8E5022', '#EDD8B4', '#442D1C'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8E5022', '#EDD8B4', '#442D1C'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      // CHANGED: Reduced padding from p-8/p-12 to p-6/p-10
      className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-stone-100 max-w-lg w-full text-center relative overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        // CHANGED: Reduced w-24 h-24 to w-20 h-20 and mb-8 to mb-6
        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        {/* CHANGED: Reduced icon size */}
        <CheckCircle className="w-10 h-10 text-green-600" />
      </motion.div>

      {/* CHANGED: Reduced text size and margin */}
      <h1 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-3">
        Thank you for your order!
      </h1>

      {/* CHANGED: Reduced margin bottom */}
      <p className="text-stone-600 mb-6 text-base md:text-lg leading-relaxed">
        Your clay treasures have been secured. We are preparing them for their
        journey to your home.
      </p>

      {orderId ? (
        // CHANGED: Reduced padding (p-6 -> p-4) and margin (mb-8 -> mb-6)
        <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EDD8B4]/30 mb-6">
          <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-1">
            Order Reference
          </p>
          <div className="flex items-center justify-center gap-2 text-[#8E5022]">
            <Package className="w-4 h-4" />
            <span className="font-mono text-lg font-medium tracking-wide">
              {orderId}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-[#FDFBF7] p-4 rounded-xl border border-stone-100 mb-6 text-stone-500 text-sm">
          Check your email for the order confirmation details.
        </div>
      )}

      {/* CHANGED: Reduced vertical space between buttons */}
      <div className="space-y-3">
        {orderId && (
          <Link href={`/profile/orders/${orderId}`} className="block">
            {/* CHANGED: Reduced button height (py-4 -> py-3) */}
            <button className="w-full bg-[#442D1C] text-white py-3 rounded-xl font-medium hover:bg-[#2c1d12] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
              <Package className="w-5 h-5" />
              Track Order
            </button>
          </Link>
        )}

        <Link href="/products" className="block">
          {/* CHANGED: Reduced button height (py-4 -> py-3) */}
          <button className="w-full bg-[#8E5022] text-white py-3 rounded-xl font-medium hover:bg-[#652810] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group">
            Continue Shopping
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>

        <Link href="/" className="block">
          {/* CHANGED: Reduced button height (py-4 -> py-3) */}
          <button className="w-full bg-white border-2 border-stone-100 text-stone-600 py-3 rounded-xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-all flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            Return Home
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    // CHANGED: Added pt-20 to ensure content starts below the navbar visually
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/20 flex items-center justify-center p-4 pt-24 md:pt-20">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
            <p className="text-stone-600">Loading order details...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
