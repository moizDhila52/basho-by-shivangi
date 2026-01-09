'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ClientItemsList({ items }) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 3;

  // Decide which items to display
  const displayedItems = showAll ? items : items.slice(0, INITIAL_LIMIT);
  const remainingCount = items.length - INITIAL_LIMIT;

  return (
    <div className="p-2">
      <div className="space-y-1">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 hover:bg-[#FDFBF7] rounded-xl transition-colors group"
          >
            <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex-1 flex justify-between items-start">
              <div>
                <Link href={`/products/${item.productSlug}`}>
                  <h4 className="font-medium text-[#442D1C] hover:text-[#8E5022] cursor-pointer transition-colors">
                    {item.productName}
                  </h4>
                </Link>
                <p className="text-xs text-stone-500 mt-1">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-serif text-[#442D1C] font-medium">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {items.length > INITIAL_LIMIT && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#8E5022] hover:bg-[#FDFBF7] transition-colors mt-2 rounded-xl"
        >
          {showAll ? (
            <>
              Show Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show {remainingCount} more item{remainingCount !== 1 ? 's' : ''}{' '}
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
