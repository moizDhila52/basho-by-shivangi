'use client';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  CheckCircle,
  Truck,
  Clock,
  Package,
  AlertCircle,
  Eye,
  Download,
  Printer,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  X,
  ClipboardCheck,
  Trash2,
  BarChart2,
  TrendingUp,
  Heart,
  ShoppingCart,
  ChevronRight,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useToast } from '@/components/ToastProvider';
import React from 'react';
import { useNotification } from '@/context/NotificationContext';

const STATUS_FLOW = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const { refreshTrigger, markAsRead } = useNotification();
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Analytics States
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [fullListType, setFullListType] = useState(null); // 'PURCHASES' | 'WISHLIST' | 'CART'

  // Analytics Data State
  const [analyticsData, setAnalyticsData] = useState({
    purchases: { top5: [], all: [] },
    wishlist: { top5: [], all: [] },
    cart: { top5: [], all: [] },
  });

  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [dateRange, setDateRange] = useState('all');

  const { addToast } = useToast();

  // 1. Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    markAsRead();
  }, []);

  useEffect(() => {
    if (refreshTrigger.orders > 0) {
      fetchOrders();
    }
  }, [refreshTrigger.orders]);

  // 2. Fetch Analytics (Includes Safety Checks to prevent crashes)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const data = await res.json();
          // Using (|| []) ensures slicing doesn't crash the app if data is undefined
          setAnalyticsData({
            purchases: {
              top5: (data.topProducts || []).slice(0, 5),
              all: data.topProducts || [],
            },
            wishlist: {
              top5: (data.mostWishlisted || []).slice(0, 5),
              all: data.mostWishlisted || [],
            },
            cart: {
              top5: (data.mostCarted || []).slice(0, 5),
              all: data.mostCarted || [],
            },
          });
        }
      } catch (error) {
        console.error('Analytics load failed', error);
        addToast('Failed to load analytics', 'error');
      }
    };

    if (isAnalyticsOpen) {
      fetchAnalytics();
    }
  }, [isAnalyticsOpen]);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === 'ALL' || order.status === selectedStatus;
      const searchLower = searchQuery.toLowerCase();
      const displayId = order.orderNumber || order.id.slice(-8);

      const matchesSearch =
        searchQuery === '' ||
        displayId.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower);

      let matchesDate = true;
      if (dateRange !== 'all') {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        const daysAgo = parseInt(dateRange);
        const startDate = new Date(today.setDate(today.getDate() - daysAgo));
        matchesDate = orderDate >= startDate;
      }

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [orders, selectedStatus, searchQuery, dateRange]);

  const updateOrderStatus = async (orderId, newStatus) => {
    const oldOrders = [...orders];
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    setUpdatingOrder(orderId);

    try {
      const res = await fetch(`/api/admin/orders/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');

      const data = await res.json();
      const updatedOrder = data.order || {
        ...oldOrders.find((o) => o.id === orderId),
        status: newStatus,
      };

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order)),
      );

      addToast(`Order updated to ${newStatus}`, 'success');

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setOrders(oldOrders);
      addToast('Failed to update status', 'error');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const stats = useMemo(() => {
    // 1. Define statuses that count as "Real Sales" (Money secured)
    const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

    // 2. Filter orders for Revenue & Total Counts (Excludes PENDING & CANCELLED)
    const validOrders = orders.filter((o) => validStatuses.includes(o.status));

    const totalRevenue = validOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    const today = new Date().toDateString();

    return {
      totalRevenue: totalRevenue.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
      }),
      totalOrders: validOrders.length, // Only counts Confirmed+ orders

      // 3. Active = Orders that need fulfillment (Confirmed/Processing/Shipped)
      // We removed 'PENDING' from here as requested
      pendingOrders: orders.filter((o) =>
        ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status),
      ).length,

      todayOrders: validOrders.filter(
        (o) => new Date(o.createdAt).toDateString() === today,
      ).length,
    };
  }, [orders]);
  const verifyPayment = async (order) => {
    if (!order.razorpayOrderId) {
      addToast('No Razorpay Order ID linked', 'error');
      return;
    }
    const loadingToast = toast.loading('Verifying with Razorpay...');
    try {
      const res = await fetch('/api/admin/orders/verify', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
        }),
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.success) {
        toast.success('Payment Verified! Order Confirmed.');
        fetchOrders();
      } else {
        toast.error('Payment not found on Razorpay.');
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error('Verification failed');
    }
  };

  const handleCleanup = async () => {
    const toastId = toast.loading('Checking for expired pending orders...');
    try {
      const res = await fetch('/api/admin/orders/cleanup', { method: 'POST' });
      const data = await res.json();
      toast.dismiss(toastId);
      if (data.success) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast(data.message || 'No cleanup needed', { icon: '🧹' });
      }
    } catch (e) {
      toast.dismiss(toastId);
      toast.error('Cleanup failed');
    }
  };

  const handleExportOrders = () => {
    const csvData = filteredOrders.map((order) => ({
      'Order ID': order.orderNumber || order.id,
      Customer: order.customerName,
      Email: order.customerEmail,
      Phone: order.customerPhone || 'N/A',
      GSTIN: order.customerGst || 'N/A',
      Amount: order.total,
      Status: order.status,
      Date: format(new Date(order.createdAt), 'dd/MM/yyyy'),
      Items: order.OrderItem?.map(
        (item) => `${item.productName} (x${item.quantity})`,
      ).join('; '),
    }));

    const headers = Object.keys(csvData[0] || {});
    if (headers.length === 0) return;

    const rows = csvData.map((row) =>
      headers.map((header) => JSON.stringify(row[header])).join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addToast('Export downloaded successfully', 'success');
  };

  // --- HELPER FOR FULL LIST MODAL CONTENT ---
  const getFullListData = () => {
    switch (fullListType) {
      case 'PURCHASES':
        return {
          title: 'All Product Sales',
          data: analyticsData.purchases.all,
          type: 'sales',
        };
      case 'WISHLIST':
        return {
          title: 'Most Wishlisted Products',
          data: analyticsData.wishlist.all,
          type: 'wishlist',
        };
      case 'CART':
        return {
          title: 'Products in Cart',
          data: analyticsData.cart.all,
          type: 'cart',
        };
      default:
        return { title: '', data: [], type: '' };
    }
  };

  const fullListContent = getFullListData();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C85428] animate-spin mx-auto mb-4" />
          <p className="text-[#8E5022] font-serif">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C]">
            Orders
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Track and fulfill customer orders
          </p>
        </div>
        
        {/* Actions Scrollable Container on Mobile */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#442D1C] text-[#EDD8B4] rounded-lg hover:bg-[#652810] transition-colors text-xs md:text-sm font-medium shadow-md whitespace-nowrap"
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>

          <button
            onClick={handleCleanup}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" /> Release Stock
          </button>
          
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 border border-[#EDD8B4] text-[#8E5022] rounded-lg hover:bg-[#FDFBF7] transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          
          <button
            onClick={fetchOrders}
            className="p-2 border border-[#EDD8B4] rounded-lg hover:bg-[#FDFBF7] text-[#8E5022]"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards - Grid adjusted for mobile (2 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Total Revenue"
          value={stats.totalRevenue}
          icon={<Package className="text-[#C85428]" />}
          color="bg-[#C85428]/10"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={<Package className="text-[#8E5022]" />}
          color="bg-[#8E5022]/10"
        />
        <StatCard
          label="Active"
          value={stats.pendingOrders}
          icon={<Clock className="text-[#F59E0B]" />}
          color="bg-[#F59E0B]/10"
        />
        <StatCard
          label="Today"
          value={stats.todayOrders}
          icon={<Calendar className="text-[#10B981]" />}
          color="bg-[#10B981]/10"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-auto appearance-none pl-3 pr-8 py-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none cursor-pointer min-w-[150px]"
            >
              <option value="all">All Time</option>
              <option value="1">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022] pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            'ALL',
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
          ].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                selectedStatus === status
                  ? 'bg-[#442D1C] text-[#EDD8B4]'
                  : 'bg-[#FDFBF7] text-[#8E5022] border border-[#EDD8B4] hover:border-[#C85428]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* --- MOBILE CARD VIEW (Visible only on mobile) --- */}
      <div className="block md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white border border-[#EDD8B4] rounded-xl p-4 shadow-sm flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2">
                     <span className="font-mono font-bold text-[#442D1C] text-sm">
                       #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                     </span>
                     {order.customerGst && (
                        <span className="text-[10px] font-bold bg-[#442D1C] text-[#EDD8B4] px-1 rounded border border-[#EDD8B4]">
                           B2B
                        </span>
                     )}
                  </div>
                  <div className="text-xs text-[#8E5022] mt-0.5">
                     {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                  </div>
               </div>
               <StatusBadge status={order.status} />
            </div>

            <hr className="border-[#EDD8B4]/30" />

            {/* Content */}
            <div className="flex gap-3">
               <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center overflow-hidden border border-[#C85428]/30 flex-shrink-0">
                   {order.User?.image ? (
                      <img
                        src={order.User.image}
                        alt={order.customerName}
                        className="w-full h-full object-cover"
                      />
                   ) : (
                      <User className="w-5 h-5 text-[#442D1C]" />
                   )}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#442D1C] text-sm truncate">{order.customerName || 'Guest'}</div>
                  <div className="text-xs text-[#8E5022] truncate">{order.customerEmail}</div>
                  
                  <div className="mt-2 text-xs bg-[#FDFBF7] p-2 rounded border border-[#EDD8B4]/50">
                     {order.OrderItem?.slice(0, 1).map((item, idx) => (
                        <span key={idx} className="block truncate">
                           {item.quantity}x {item.productName}
                        </span>
                     ))}
                     {order.OrderItem?.length > 1 && (
                        <span className="text-[#C85428] font-medium block mt-1">
                          +{order.OrderItem.length - 1} more items
                        </span>
                     )}
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 mt-1">
               <div className="font-bold text-[#442D1C]">
                  ₹{order.total?.toLocaleString()}
               </div>
               <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={updatingOrder === order.id}
                    className="bg-white border border-[#EDD8B4] rounded text-xs py-1.5 px-2 focus:ring-1 focus:ring-[#C85428] outline-none max-w-[110px]"
                  >
                     <option value="PENDING">Pending</option>
                     <option value="CONFIRMED">Confirm</option>
                     <option value="PROCESSING">Process</option>
                     <option value="SHIPPED">Ship</option>
                     <option value="DELIVERED">Deliver</option>
                     <option value="CANCELLED">Cancel</option>
                  </select>
                  <button
                    onClick={() => viewOrderDetails(order)}
                    className="p-1.5 bg-[#442D1C]/5 text-[#442D1C] rounded hover:bg-[#EDD8B4]/20"
                  >
                     <Eye className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-[#8E5022] bg-white rounded-xl border border-[#EDD8B4]">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No orders found.</p>
          </div>
        )}
      </div>

      {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
      <div className="hidden md:block bg-white rounded-xl border border-[#EDD8B4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#EDD8B4] text-xs font-bold text-[#8E5022] uppercase tracking-wider">
                <th className="p-4">Order Details</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDD8B4]/30 text-sm text-[#442D1C]">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#FDFBF7]/50 transition-colors"
                >
                  <td className="p-4">
                    <span className="font-mono font-bold">
                      #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                    </span>
                    <div className="text-xs text-[#8E5022] mt-1">
                      {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EDD8B4] flex items-center justify-center overflow-hidden border border-[#C85428]/30">
                        {order.User?.image ? (
                          <img
                            src={order.User.image}
                            alt={order.customerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-[#442D1C]" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#442D1C]">
                          {order.customerName || 'Guest'}
                        </span>
                        {order.customerGst && (
                          <span className="text-[10px] font-bold bg-[#442D1C] text-[#EDD8B4] px-1.5 py-0.5 rounded border border-[#EDD8B4]">
                            B2B
                          </span>
                        )}

                        <span className="text-xs text-[#8E5022]">
                          {order.customerEmail}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs space-y-1">
                      {order.OrderItem?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between w-32">
                          <span className="truncate">{item.productName}</span>
                          <span className="text-[#8E5022]">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.OrderItem?.length > 2 && (
                        <span className="text-[#C85428] font-medium">
                          +{order.OrderItem.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold">
                    ₹{order.total?.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <StatusBadge status={order.status} />
                      <div className="flex gap-1 h-1 w-24">
                        {STATUS_FLOW.map((s, i) => (
                          <div
                            key={s}
                            className={`flex-1 rounded-full ${
                              order.status === 'CANCELLED'
                                ? 'bg-red-500' 
                                : STATUS_FLOW.indexOf(order.status) >= i
                                ? getStatusColor(order.status, true)
                                : 'bg-[#EDD8B4]/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => verifyPayment(order)}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 whitespace-nowrap"
                        >
                          Verify Payment
                        </button>
                      )}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={updatingOrder === order.id}
                        className="bg-white border border-[#EDD8B4] rounded-lg text-xs py-1.5 px-2 focus:ring-1 focus:ring-[#C85428] outline-none disabled:opacity-50 cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="p-1.5 text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-[#8E5022]">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No orders found matching your filters.</p>
          </div>
        )}
      </div>

      {/* --- ANALYTICS MODAL (IMPROVED RESPONSIVENESS) --- */}
      <AnimatePresence>
        {isAnalyticsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-[#442D1C]/60 backdrop-blur-sm"
            onClick={() => setIsAnalyticsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              // Full height on mobile (h-full), rounded top only or none
              className="bg-white md:rounded-2xl shadow-2xl w-full max-w-5xl h-full md:h-[85vh] flex flex-col overflow-hidden relative"
            >
              <div className="p-4 md:p-6 bg-[#FDFBF7] border-b border-[#EDD8B4] flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-[#442D1C] flex items-center gap-2">
                    <BarChart2 className="text-[#C85428]" /> Product Analytics
                  </h2>
                  <p className="text-xs md:text-sm text-[#8E5022]">
                    Real-time insights based on current data.
                  </p>
                </div>
                <button
                  onClick={() => setIsAnalyticsOpen(false)}
                  className="p-2 hover:bg-[#EDD8B4]/20 rounded-full text-[#8E5022]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 bg-gray-50/50">
                {/* 1. TOP SELLING PRODUCTS */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4 md:mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" /> Most
                    Purchased
                  </h3>
                  <div className="space-y-3 md:space-y-4 flex-1">
                    {analyticsData.purchases.top5.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-[#FDFBF7] rounded-lg transition-colors border border-transparent hover:border-[#EDD8B4]"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full w-fit mt-1">
                            {item.qty}{' '}
                            {item.qty === 1 ? 'purchase' : 'purchases'}
                          </p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-bold text-[#C85428]">
                            ₹
                            {item.revenue ? item.revenue.toLocaleString() : '-'}
                          </p>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-gray-200">
                          #{i + 1}
                        </div>
                      </div>
                    ))}
                    {analyticsData.purchases.top5.length === 0 && (
                      <p className="text-center text-gray-400 py-4">
                        No sales data yet.
                      </p>
                    )}
                  </div>

                  {analyticsData.purchases.all.length > 5 && (
                    <button
                      onClick={() => setFullListType('PURCHASES')}
                      className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-[#8E5022] hover:bg-[#FDFBF7] rounded-lg transition-colors border border-dashed border-[#EDD8B4]"
                    >
                      View All Purchases <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 2. MOST WISHLISTED */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4 md:mb-6 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" /> Most Wishlisted
                  </h3>
                  <div className="space-y-3 md:space-y-4 flex-1">
                    {analyticsData.wishlist.top5.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-[#FDFBF7] rounded-lg transition-colors border border-transparent hover:border-[#EDD8B4]"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full w-fit mt-1">
                            Wishlisted by {item.qty} users
                          </p>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-gray-200">
                          #{i + 1}
                        </div>
                      </div>
                    ))}
                    {analyticsData.wishlist.top5.length === 0 && (
                      <p className="text-center text-gray-400 py-4">
                        No data available.
                      </p>
                    )}
                  </div>

                  {analyticsData.wishlist.all.length > 5 && (
                    <button
                      onClick={() => setFullListType('WISHLIST')}
                      className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-[#8E5022] hover:bg-[#FDFBF7] rounded-lg transition-colors border border-dashed border-[#EDD8B4]"
                    >
                      View All Wishlist <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 3. MOST CARTED */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:col-span-2">
                  <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4 md:mb-6 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" /> High Cart
                    Additions
                  </h3>
                  <div className="space-y-3 md:space-y-4 flex-1">
                    {analyticsData.cart.top5.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-[#FDFBF7] rounded-lg transition-colors border border-transparent hover:border-[#EDD8B4]"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">
                            In {item.qty} active carts
                          </p>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-gray-200">
                          #{i + 1}
                        </div>
                      </div>
                    ))}
                    {analyticsData.cart.top5.length === 0 && (
                      <p className="text-center text-gray-400 py-4">
                        No data available.
                      </p>
                    )}
                  </div>

                  {analyticsData.cart.all.length > 5 && (
                    <button
                      onClick={() => setFullListType('CART')}
                      className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-[#8E5022] hover:bg-[#FDFBF7] rounded-lg transition-colors border border-dashed border-[#EDD8B4]"
                    >
                      View All Cart Additions{' '}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* --- NESTED MODAL: DYNAMIC FULL LIST (Mobile Optimized) --- */}
              <AnimatePresence>
                {fullListType && (
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-0 bg-white z-10 flex flex-col"
                  >
                    <div className="p-4 md:p-6 bg-[#FDFBF7] border-b border-[#EDD8B4] flex items-center gap-4">
                      <button
                        onClick={() => setFullListType(null)}
                        className="p-2 hover:bg-[#EDD8B4]/20 rounded-full text-[#442D1C]"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-serif text-lg md:text-xl font-bold text-[#442D1C]">
                        {fullListContent.title}
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                      {fullListContent.data.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start md:items-center gap-4 md:gap-6 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                        >
                          <div className="text-2xl md:text-3xl font-bold text-[#EDD8B4] w-8 md:w-12 text-center flex-shrink-0 mt-1 md:mt-0">
                            #{i + 1}
                          </div>
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-[#EDD8B4]">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base md:text-lg text-[#442D1C] truncate">
                              {item.name}
                            </p>

                            {fullListContent.type === 'sales' && (
                              <div className="flex flex-col md:flex-row md:gap-4 mt-1">
                                <span className="text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-medium w-fit">
                                  {item.qty} Purchases
                                </span>
                                <span className="text-sm text-[#8E5022]">
                                  Total Revenue: ₹
                                  {item.revenue.toLocaleString()}
                                </span>
                              </div>
                            )}

                            {fullListContent.type === 'wishlist' && (
                              <div className="flex gap-4 mt-1">
                                <span className="text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-medium">
                                  {item.qty} Users Wishlisted
                                </span>
                              </div>
                            )}

                            {fullListContent.type === 'cart' && (
                              <div className="flex gap-4 mt-1">
                                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                                  In {item.qty} Active Carts
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal (Mobile Responsive) */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-[#442D1C]/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white md:rounded-xl shadow-2xl w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 bg-[#FDFBF7] border-b border-[#EDD8B4] flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-[#442D1C]">
                    Order #{selectedOrder.orderNumber || selectedOrder.id}
                  </h2>
                  <p className="text-xs md:text-sm text-[#8E5022] mt-1">
                    {format(
                      new Date(selectedOrder.createdAt),
                      "MMMM dd, yyyy 'at' HH:mm",
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#8E5022] hover:text-[#442D1C]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Payment Verification */}
                {selectedOrder.status === 'PENDING' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-full text-amber-700 mt-1">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 text-sm">
                          Payment Verification Needed
                        </h4>
                        <p className="text-xs text-amber-800 mt-1 mb-3 leading-relaxed">
                          This order is <strong>Pending</strong>. Stock is
                          currently reserved (1 qty).
                          <br />• If customer claims they paid: Click{' '}
                          <strong>Verify</strong> to check Razorpay status.
                          <br />• If abandoned/failed: Click{' '}
                          <strong>Cancel</strong> to release stock immediately.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => verifyPayment(selectedOrder)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" /> Verify with
                            Razorpay
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(selectedOrder.id, 'CANCELLED')
                            }
                            className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                          >
                            Cancel Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice Correction */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-6">
                  <h3 className="font-serif font-bold text-[#442D1C] text-sm mb-3 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-[#8E5022]" /> Invoice
                    Correction
                  </h3>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">
                        Customer GSTIN
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedOrder.customerGst || ''}
                        id="admin-gst-input"
                        placeholder="Enter GSTIN"
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none uppercase"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        const input =
                          document.getElementById('admin-gst-input');
                        const newGst = input.value.trim().toUpperCase();

                        const oldOrder = selectedOrder;
                        setSelectedOrder({
                          ...selectedOrder,
                          customerGst: newGst,
                        });

                        try {
                          const res = await fetch('/api/admin/orders/update', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: selectedOrder.id,
                              customerGst: newGst,
                              status: selectedOrder.status,
                            }),
                          });

                          if (!res.ok) throw new Error('Failed');
                          toast.success(
                            'GST Updated! User can now download Tax Invoice.',
                          );
                          fetchOrders();
                        } catch (e) {
                          setSelectedOrder(oldOrder);
                          toast.error('Failed to save GST');
                        }
                      }}
                      className="px-4 py-2 bg-[#442D1C] text-white text-sm font-medium rounded-lg hover:bg-[#2c1d12] transition-colors h-[38px]"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Customer & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2 mb-4">
                      Customer
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EDD8B4] flex items-center justify-center overflow-hidden border border-[#C85428]/30">
                          {selectedOrder.User?.image ? (
                            <img
                              src={selectedOrder.User.image}
                              alt={selectedOrder.customerName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-[#442D1C]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#442D1C]">
                            {selectedOrder.customerName || 'Guest'}
                          </p>
                          <p className="text-[#8E5022]">
                            {selectedOrder.customerEmail}
                          </p>
                        </div>
                      </div>
                      {selectedOrder.customerPhone && (
                        <div className="flex items-center gap-2 text-[#442D1C] ml-11">
                          <Phone className="w-3 h-3 text-[#8E5022]" />{' '}
                          {selectedOrder.customerPhone}
                        </div>
                      )}
                    </div>

                    {selectedOrder.customerGst && (
                      <div className="mt-4 p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg">
                        <div className="text-xs font-bold text-[#8E5022] uppercase tracking-wider mb-2">
                          Tax Invoice Details
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#442D1C] text-sm font-medium">
                            GSTIN: {selectedOrder.customerGst}
                          </span>
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
                            B2B
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2 mb-4">
                      Shipping Address
                    </h3>
                    {selectedOrder.address ? (
                      <div className="flex gap-3 text-sm text-[#442D1C]">
                        <MapPin className="w-4 h-4 text-[#8E5022] mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {selectedOrder.address.street}
                          </p>
                          <p>
                            {selectedOrder.address.city},{' '}
                            {selectedOrder.address.state}
                          </p>
                          <p>{selectedOrder.address.pincode}</p>
                          <p className="text-[#8E5022] text-xs mt-1 uppercase font-bold">
                            {selectedOrder.address.country || 'India'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm italic text-[#8E5022]">
                        No address provided
                      </p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2 mb-4">
                    Items Ordered
                  </h3>
                  <div className="border border-[#EDD8B4] rounded-xl overflow-hidden">
                    {selectedOrder.OrderItem?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-[#FDFBF7] border-b border-[#EDD8B4] last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white border border-[#EDD8B4] rounded-lg overflow-hidden flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                className="w-full h-full object-cover"
                                alt={item.productName}
                              />
                            ) : (
                              <Package className="p-2 text-[#EDD8B4] w-full h-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#442D1C]">
                              {item.productName}
                            </p>
                            <p className="text-xs text-[#8E5022]">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#442D1C]">
                            ₹{item.price}
                          </p>
                          <p className="text-xs text-[#8E5022]">
                            Total: ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financials */}
                <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#EDD8B4]">
                  <div className="flex justify-between mb-2 text-sm text-[#442D1C]">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm text-[#442D1C]">
                    <span>Shipping</span>
                    <span>₹{selectedOrder.shippingCost?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between mb-2 text-sm text-[#442D1C]">
                      <span>Tax (GST)</span>
                      <span>₹{selectedOrder.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between mb-2 text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-[#EDD8B4] font-bold text-lg text-[#442D1C]">
                    <span>Total Paid</span>
                    <span>₹{selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 bg-[#FDFBF7] border-t border-[#EDD8B4] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs text-[#8E5022] w-full sm:w-auto">
                  <span className="font-bold mr-2">Update Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      updateOrderStatus(selectedOrder.id, e.target.value)
                    }
                    className="bg-white border border-[#EDD8B4] rounded p-2 focus:ring-1 focus:ring-[#C85428] outline-none cursor-pointer text-sm w-full sm:w-auto"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={`/admin/orders/label/${selectedOrder.id}`}
                    target="_blank"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-[#442D1C] text-[#442D1C] rounded-lg hover:bg-[#EDD8B4]/20 transition-colors text-sm font-medium"
                  >
                    <Package className="w-4 h-4" />
                    Label
                  </Link>

                  <Link
                    href={`/invoice/${selectedOrder.id}`}
                    target="_blank"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#442D1C] text-white rounded-lg hover:bg-[#2c1d12] transition-colors text-sm font-medium shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Invoice
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components (Unchanged)
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-[#8E5022] font-bold uppercase">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-[#442D1C] mt-1">{value}</p>
      </div>
      <div className={`p-2 md:p-3 rounded-lg ${color}`}>
        {React.cloneElement(icon, { className: `${icon.props.className} w-5 h-5 md:w-6 md:h-6` })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  const icons = {
    PENDING: Clock,
    CONFIRMED: ClipboardCheck,
    PROCESSING: Package,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: XCircle,
  };

  const Icon = icons[status] || AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold border ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

function getStatusColor(status, bg = false) {
  switch (status) {
    case 'PENDING':
      return bg ? 'bg-yellow-400' : 'text-yellow-600';
    case 'CONFIRMED':
      return bg ? 'bg-indigo-400' : 'text-indigo-600';
    case 'PROCESSING':
      return bg ? 'bg-blue-400' : 'text-blue-600';
    case 'SHIPPED':
      return bg ? 'bg-purple-400' : 'text-purple-600';
    case 'DELIVERED':
      return bg ? 'bg-green-400' : 'text-green-600';
    case 'CANCELLED':
      return bg ? 'bg-red-400' : 'text-red-600';
    default:
      return bg ? 'bg-gray-400' : 'text-gray-600';
  }
}