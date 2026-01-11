'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  DollarSign,
  Package,
  Loader2,
} from 'lucide-react';

export default function MyCustomOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/custom-orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'QUOTED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'APPROVED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8E5022]" />
      </div>
    );

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#EDD8B4] p-12 text-center h-full flex flex-col items-center justify-center">
        <Sparkles className="w-12 h-12 text-[#EDD8B4] mb-4" />
        <h3 className="font-serif text-xl text-[#442D1C] mb-2">
          No Custom Requests
        </h3>
        <p className="text-[#8E5022] mb-6">
          Have an idea? Commission a unique piece.
        </p>
        <Link
          href="/custom-order"
          className="text-[#C85428] font-bold hover:underline"
        >
          Start a Request
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-[#442D1C]">Custom Requests</h2>
        <Link
          href="/custom-order"
          className="text-sm font-bold text-[#C85428] hover:underline flex items-center gap-1"
        >
          <Sparkles size={14} /> New Request
        </Link>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/profile/custom-orders/${order.id}`}>
            <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FDFBF7] flex items-center justify-center border border-[#EDD8B4] shrink-0">
                    <Package className="w-6 h-6 text-[#8E5022]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#442D1C] text-lg group-hover:text-[#C85428] transition-colors">
                      {order.productType}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      ID: {order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {order.status.replace('_', ' ')}
                </div>

                {/* Price or Date */}
                <div className="text-right min-w-[100px]">
                  {order.status === 'QUOTED' && order.actualPrice ? (
                    <div>
                      <p className="text-xs text-stone-500 uppercase font-bold">
                        Quote Price
                      </p>
                      <p className="text-xl font-bold text-[#442D1C]">
                        ₹{order.actualPrice}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
