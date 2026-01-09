'use client';

import { Printer } from 'lucide-react';

export default function InvoiceActions() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-[#442D1C] text-white rounded-lg shadow hover:bg-[#2c1d12] transition-colors font-medium text-sm"
    >
      <Printer className="w-4 h-4" />
      Print / Download PDF
    </button>
  );
}
