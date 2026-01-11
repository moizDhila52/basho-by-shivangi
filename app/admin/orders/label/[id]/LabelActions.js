'use client';
import { Printer } from 'lucide-react';

export default function LabelActions() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full shadow-lg hover:bg-stone-800 transition-colors font-bold"
    >
      <Printer className="w-5 h-5" />
      Print Label
    </button>
  );
}