'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Calendar,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import { useNotification } from '@/context/NotificationContext';

export default function AdminCustomOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { refreshTrigger, markAsRead } = useNotification();

  useEffect(() => {
    markAsRead('customOrders');
  }, []);

  // 4. Real-Time Listener
  useEffect(() => {
    if (refreshTrigger.customOrders > 0) {
      loadOrders(); // Re-fetch the table silently without page reload
    }
  }, [refreshTrigger.customOrders]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadOrders();
    }
  }, [user, filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/custom-orders?status=${filter !== 'all' ? filter : ''}`,
      );

      if (!response.ok) throw new Error('Failed to load orders');

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-[#442D1C] mb-4">
            Access Denied
          </h2>
          <p className="text-stone-600">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'REVIEWED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'QUOTED':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
            Custom Orders
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Manage and review custom order requests
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-[#EDD8B4]/30">
        {[
          'all',
          'PENDING',
          'REVIEWED',
          'QUOTED',
          'IN_PROGRESS',
          'COMPLETED',
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
              filter === status
                ? 'bg-[#8E5022] text-white shadow-md'
                : 'bg-white text-stone-500 hover:bg-[#EDD8B4]/20 border border-transparent hover:border-[#EDD8B4]'
            }`}
          >
            {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#EDD8B4] border-dashed">
          <Package className="w-12 h-12 text-[#EDD8B4] mx-auto mb-4" />
          <h3 className="text-[#442D1C] font-bold text-lg mb-1">
            No orders found
          </h3>
          <p className="text-stone-500 text-sm">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id}
              className="group bg-white rounded-2xl border border-[#EDD8B4] p-5 hover:shadow-lg hover:border-[#C85428]/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* ID & Basic Info */}
                <div className="flex items-start gap-4 min-w-[240px]">
                  <div className="w-12 h-12 rounded-xl bg-[#FDFBF7] border border-[#EDD8B4] flex items-center justify-center text-[#C85428] shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-stone-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-xs text-stone-300">•</span>
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#442D1C] text-lg group-hover:text-[#C85428] transition-colors">
                      {order.productType}
                    </h3>
                    <p className="text-sm text-[#8E5022]">
                      Qty: {order.quantity} • {order.material}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                    Customer
                  </p>
                  <p className="font-medium text-[#442D1C]">
                    {order.contactName}
                  </p>
                  <p className="text-xs text-stone-500">{order.contactEmail}</p>
                </div>

                {/* Status Badge */}
                <div className="min-w-[140px]">
                  <p className="text-xs font-bold text-[#8E5022] uppercase mb-2 md:hidden">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-500'
                          : 'bg-[#C85428]'
                      }`}
                    ></span>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Action */}
                <Link
                  href={`/admin/custom-orders/${order.id}`}
                  className="w-full md:w-auto px-5 py-2.5 bg-[#FDFBF7] hover:bg-[#EDD8B4] text-[#442D1C] border border-[#EDD8B4] rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  View Details <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
