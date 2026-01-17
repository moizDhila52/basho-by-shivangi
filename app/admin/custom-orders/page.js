'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  IndianRupee,
  Activity,
  FileText
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

  // --- ANALYTICS CALCULATION ---
  // --- ANALYTICS CALCULATION ---
  const stats = useMemo(() => {
    // Define statuses that signify a confirmed deal/revenue
    const validRevenueStatuses = ['APPROVED', 'IN_PROGRESS', 'COMPLETED'];

    // 1. Calculate Total Revenue (Sum of actualPrice for valid orders)
    const totalRevenue = orders.reduce((sum, order) => {
      // Only count revenue if the order is in a confirmed status AND has a price
      if (validRevenueStatuses.includes(order.status) && order.actualPrice) {
        return sum + order.actualPrice;
      }
      return sum;
    }, 0);

    // 2. Count Total Requests (All non-cancelled)
    // We usually still want to see the total volume of requests coming in
    const totalRequests = orders.filter(o => o.status !== 'CANCELLED').length;

    // 3. Pending Reviews (Action needed by Admin)
    const pendingReviews = orders.filter((o) => o.status === 'PENDING').length;

    // 4. Active Production (In Progress)
    const inProduction = orders.filter(
      (o) => o.status === 'IN_PROGRESS',
    ).length;

    return {
      revenue: totalRevenue.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
      }),
      totalRequests,
      pendingReviews,
      inProduction,
    };
  }, [orders]);
  
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
    <div className="space-y-6 md:space-y-8 pb-12 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C]">
            Custom Orders
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Manage and review custom order requests
          </p>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      {/* Changed to grid-cols-2 on mobile for better density */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Total Custom Revenue"
          value={stats.revenue}
          icon={<IndianRupee className="text-[#C85428]" />}
          color="bg-[#C85428]/10"
        />
        <StatCard
          label="Total Requests"
          value={stats.totalRequests}
          icon={<FileText className="text-[#8E5022]" />}
          color="bg-[#8E5022]/10"
        />
        <StatCard
          label="Pending Review"
          value={stats.pendingReviews}
          icon={<Clock className="text-[#F59E0B]" />}
          color="bg-[#F59E0B]/10"
        />
        <StatCard
          label="In Production"
          value={stats.inProduction}
          icon={<Activity className="text-[#10B981]" />}
          color="bg-[#10B981]/10"
        />
      </div>

      {/* Filter Tabs */}
      {/* Added horizontal scroll for mobile to prevent stacking and layout breakage */}
      <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 min-w-max">
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
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                filter === status
                  ? 'bg-[#8E5022] text-white shadow-md'
                  : 'bg-white text-stone-500 hover:bg-[#EDD8B4]/20 border border-transparent hover:border-[#EDD8B4]'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
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
              className="group bg-white rounded-2xl border border-[#EDD8B4] p-4 md:p-5 hover:shadow-lg hover:border-[#C85428]/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Main Content Flex Container */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
                
                {/* ID & Basic Info */}
                <div className="flex items-start gap-4 w-full md:w-auto md:min-w-[240px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#FDFBF7] border border-[#EDD8B4] flex items-center justify-center text-[#C85428] shrink-0 mt-1 md:mt-0">
                    <Package size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between md:justify-start gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-stone-400">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-stone-300">•</span>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Calendar size={12} />
                          <span className="hidden xs:inline">{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="xs:hidden">{new Date(order.createdAt).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</span>
                        </span>
                      </div>
                      
                      {/* Mobile Status Badge (Top Right) */}
                      <div className="md:hidden">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            order.status === 'COMPLETED' ? 'bg-emerald-500' :
                            order.status === 'PENDING' ? 'bg-yellow-500' :
                            'bg-[#C85428]'
                          }`}
                        />
                      </div>
                    </div>

                    <h3 className="font-bold text-[#442D1C] text-base md:text-lg group-hover:text-[#C85428] transition-colors truncate pr-4 md:pr-0">
                      {order.productType}
                    </h3>
                    <p className="text-sm text-[#8E5022] truncate">
                      Qty: {order.quantity} • {order.material}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="w-full md:flex-1 pl-[56px] md:pl-0 -mt-2 md:mt-0">
                  <p className="text-[10px] md:text-xs font-bold text-[#8E5022] uppercase mb-0.5 md:mb-1">
                    Customer
                  </p>
                  <p className="font-medium text-[#442D1C] text-sm md:text-base truncate">
                    {order.contactName}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{order.contactEmail}</p>
                </div>

                {/* Desktop Status Badge (Hidden on Mobile) */}
                <div className="hidden md:block min-w-[140px]">
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

                {/* Action Button */}
                <div className="w-full md:w-auto mt-2 md:mt-0">
                   {/* Mobile Status Label (Visible above button only on mobile) */}
                   <div className="md:hidden mb-3 flex items-center justify-between border-t border-dashed border-[#EDD8B4] pt-3">
                      <span className="text-xs font-bold text-stone-500">Status</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                   </div>

                  <Link
                    href={`/admin/custom-orders/${order.id}`}
                    className="w-full md:w-auto px-5 py-3 md:py-2.5 bg-[#FDFBF7] hover:bg-[#EDD8B4] text-[#442D1C] border border-[#EDD8B4] rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                  >
                    View Details <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper Component for Stats
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
      <div>
        <p className="text-[10px] md:text-xs text-[#8E5022] font-bold uppercase truncate">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-[#442D1C] mt-0.5 md:mt-1 truncate">{value}</p>
      </div>
      <div className={`p-2 md:p-3 rounded-lg ${color} w-fit`}>
        {React.cloneElement(icon, { size: 20, className: "md:w-6 md:h-6" })}
      </div>
    </div>
  );
}