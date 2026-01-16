'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronDown, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvoiceActions({ orderId, hasGst }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div className="flex bg-[#442D1C] rounded-xl shadow-sm overflow-hidden">
        {/* Main Button - Defaults to Standard Invoice */}
        <Link 
          href={`/api/invoice/${orderId}?type=standard`} 
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium hover:bg-[#2c1d12] transition-colors"
        >
          <Download className="w-4 h-4" />
          Invoice
        </Link>

        {/* Dropdown Arrow - Only visible if GST is present */}
        {hasGst && (
          <>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2 py-2 text-white hover:bg-[#2c1d12] transition-colors focus:outline-none"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </>
        )}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && hasGst && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden"
          >
            <div className="py-1">
              <Link 
                href={`/api/invoice/${orderId}?type=standard`}
                className="flex items-center gap-2 px-4 py-3 text-sm text-stone-600 hover:bg-[#FDFBF7] hover:text-[#442D1C]"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="w-4 h-4" />
                Standard Receipt
              </Link>
              <Link 
                href={`/api/invoice/${orderId}?type=gst`}
                className="flex items-center gap-2 px-4 py-3 text-sm text-stone-600 hover:bg-[#FDFBF7] hover:text-[#442D1C] border-t border-stone-100"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-current rounded">G</div>
                GST Tax Invoice
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}