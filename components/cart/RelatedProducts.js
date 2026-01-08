'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link'; // Assuming you want clickable links

export default function RelatedProducts({ cartItems, onAdd }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // 1. Extract necessary data from cart to send to backend
        const categoryNames = [
          ...new Set(cartItems.map((item) => item.category)),
        ]; // Unique categories
        const excludeIds = cartItems.map((item) => item.id);

        // 2. Call our new API
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryNames, excludeIds }),
        });

        const data = await res.json();
        if (res.ok) {
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error('Failed to load related products', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce slightly or run only when cart structure changes deeply
    // For simplicity, we run when cartItems length or IDs change
    fetchRecommendations();
  }, [cartItems.length]); // Re-fetch if number of items changes

  if (loading) return null; // Or return a skeleton loader
//   if (recommendations.length === 0) return null;

  return (
    <div className="mt-12 pt-12 border-t border-stone-200">
      <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
        Pairs Well With
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-stone-100 flex gap-4 items-center group"
          >
            {/* Image */}
            <Link href={`/products/${item.slug}`} className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden relative cursor-pointer">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]} // Adjust based on your DB image structure (string vs object)
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-[#EDD8B4]/20 flex items-center justify-center text-stone-300">
                    <Tag className="w-6 h-6" />
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.slug}`}>
                <h4 className="font-serif text-lg text-[#442D1C] truncate group-hover:text-[#8E5022] transition-colors cursor-pointer">
                  {item.name}
                </h4>
              </Link>
              <p className="text-sm text-stone-500 mb-1">
                {item.Category?.name || 'Ceramics'}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#8E5022]">
                  ₹{Number(item.price).toFixed(2)}
                </span>
                <button
                  onClick={() =>
                    onAdd({
                      // Format item to match what your addToCart expects
                      id: item.id,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      image: item.images?.[0],
                      stock: item.stock,
                      inStock: item.inStock,
                      category: item.Category?.name,
                      quantity: 1,
                    })
                  }
                  className="w-8 h-8 rounded-full bg-[#FDFBF7] border border-[#EDD8B4] flex items-center justify-center text-[#442D1C] hover:bg-[#8E5022] hover:text-white hover:border-[#8E5022] transition-all"
                  title="Quick Add"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
