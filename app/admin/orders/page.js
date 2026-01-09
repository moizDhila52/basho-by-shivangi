"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
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
  ExternalLink,
  X,
  ClipboardCheck, // Added for Confirmed Icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useToast } from "@/components/ToastProvider";
import React from "react";

// UPDATED: Added CONFIRMED to the flow
const STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [dateRange, setDateRange] = useState("all");

  const { addToast } = useToast(); // Hook was missing in your snippet, ensuring it works

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders"); // Ensure this endpoint exists as discussed
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      addToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter
      const matchesStatus =
        selectedStatus === "ALL" || order.status === selectedStatus;

      // Search Filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower);

      // Date Filter
      let matchesDate = true;
      if (dateRange !== "all") {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        const daysAgo = parseInt(dateRange);
        const startDate = new Date(today.setDate(today.getDate() - daysAgo));
        matchesDate = orderDate >= startDate;
      }

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [orders, selectedStatus, searchQuery, dateRange]);

  // Update Status Handler
  const updateOrderStatus = async (orderId, newStatus) => {
    const oldOrders = [...orders];

    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setUpdatingOrder(orderId);

    try {
      // Assuming you created the route app/api/admin/orders/update/route.js
      // or similar based on previous steps. Adjust URL if needed.
      const res = await fetch(`/api/admin/orders/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      const updatedOrder = data.order || {
        ...oldOrders.find((o) => o.id === orderId),
        status: newStatus,
      };

      // Sync with server data
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      addToast(`Order updated to ${newStatus}`, "success");

      // If modal is open with this order, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setOrders(oldOrders); // Revert
      addToast("Failed to update status", "error");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Stats Calculation
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const today = new Date().toDateString();

    return {
      totalRevenue: totalRevenue.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      }),
      totalOrders: orders.length,
      // Group Pending and Confirmed as "Action Needed" or keep separate
      pendingOrders: orders.filter(
        (o) => o.status === "PENDING" || o.status === "CONFIRMED"
      ).length,
      todayOrders: orders.filter(
        (o) => new Date(o.createdAt).toDateString() === today
      ).length,
    };
  }, [orders]);

  // CSV Export
  const handleExportOrders = () => {
    const csvData = filteredOrders.map((order) => ({
      "Order ID": order.orderNumber,
      Customer: order.customerName,
      Email: order.customerEmail,
      Phone: order.customerPhone || "N/A",
      GSTIN: order.customerGst || "N/A",
      Amount: order.total,
      Status: order.status,
      Date: format(new Date(order.createdAt), "dd/MM/yyyy"),
      Items: order.OrderItem?.map(
        (item) => `${item.productName} (x${item.quantity})`
      ).join("; "),
    }));

    const headers = Object.keys(csvData[0] || {});
    if (headers.length === 0) return;

    const rows = csvData.map((row) =>
      headers.map((header) => JSON.stringify(row[header])).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addToast("Export downloaded successfully", "success");
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
            Orders
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Track and fulfill customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 border border-[#EDD8B4] text-[#8E5022] rounded-lg hover:bg-[#FDFBF7] transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={fetchOrders}
            className="p-2 border border-[#EDD8B4] rounded-lg hover:bg-[#FDFBF7] text-[#8E5022]"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          label="Active (Pending/Conf)"
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
              className="appearance-none pl-3 pr-8 py-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none cursor-pointer min-w-[150px]"
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
          {/* UPDATED: Added CONFIRMED to filter list */}
          {[
            "ALL",
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedStatus === status
                  ? "bg-[#442D1C] text-[#EDD8B4]"
                  : "bg-[#FDFBF7] text-[#8E5022] border border-[#EDD8B4] hover:border-[#C85428]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#EDD8B4] shadow-sm overflow-hidden">
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
                      {format(new Date(order.createdAt), "MMM dd, HH:mm")}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">
                      {order.customerName || "Guest"}
                    </div>
                    <div className="text-xs text-[#8E5022]">
                      {order.customerEmail}
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

                      {/* Status Progress Bar */}
                      <div className="flex gap-1 h-1 w-24">
                        {STATUS_FLOW.map((s, i) => (
                          <div
                            key={s}
                            className={`flex-1 rounded-full ${
                              STATUS_FLOW.indexOf(order.status) >= i
                                ? getStatusColor(order.status, true)
                                : "bg-[#EDD8B4]/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={updatingOrder === order.id}
                        className="bg-white border border-[#EDD8B4] rounded-lg text-xs py-1.5 px-2 focus:ring-1 focus:ring-[#C85428] outline-none disabled:opacity-50 cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        {/* UPDATED: Added Confirmed option */}
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-[#FDFBF7] border-b border-[#EDD8B4] flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#442D1C]">
                    Order #{selectedOrder.orderNumber || selectedOrder.id}
                  </h2>
                  <p className="text-sm text-[#8E5022] mt-1">
                    {format(
                      new Date(selectedOrder.createdAt),
                      "MMMM dd, yyyy 'at' HH:mm"
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
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Customer & Address */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-serif font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2 mb-4">
                      Customer
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EDD8B4] flex items-center justify-center">
                          <User className="w-4 h-4 text-[#442D1C]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#442D1C]">
                            {selectedOrder.customerName || "Guest"}
                          </p>
                          <p className="text-[#8E5022]">
                            {selectedOrder.customerEmail}
                          </p>
                        </div>
                      </div>
                      {selectedOrder.customerPhone && (
                        <div className="flex items-center gap-2 text-[#442D1C] ml-11">
                          <Phone className="w-3 h-3 text-[#8E5022]" />{" "}
                          {selectedOrder.customerPhone}
                        </div>
                      )}
                    </div>

                    {/* Customer GST Details */}
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
                            {selectedOrder.address.city},{" "}
                            {selectedOrder.address.state}
                          </p>
                          <p>{selectedOrder.address.pincode}</p>
                          <p className="text-[#8E5022] text-xs mt-1 uppercase font-bold">
                            {selectedOrder.address.country || "India"}
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
              <div className="p-4 bg-[#FDFBF7] border-t border-[#EDD8B4] flex justify-between items-center">
                <div className="text-xs text-[#8E5022]">
                  Update Status:
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      updateOrderStatus(selectedOrder.id, e.target.value)
                    }
                    className="ml-2 bg-white border border-[#EDD8B4] rounded p-1 focus:ring-1 focus:ring-[#C85428] outline-none cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    {/* UPDATED: Added Confirmed option */}
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-[#442D1C] hover:text-[#C85428] text-sm font-medium"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-[#8E5022] font-bold uppercase">{label}</p>
        <p className="text-2xl font-bold text-[#442D1C] mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  // UPDATED: Added CONFIRMED style
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-indigo-100 text-indigo-800 border-indigo-200", // New Style
    PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  // UPDATED: Added CONFIRMED Icon
  const icons = {
    PENDING: Clock,
    CONFIRMED: ClipboardCheck, // New Icon
    PROCESSING: Package,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: AlertCircle,
  };

  const Icon = icons[status] || AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

function getStatusColor(status, bg = false) {
  // UPDATED: Added CONFIRMED Color Logic
  switch (status) {
    case "PENDING":
      return bg ? "bg-yellow-400" : "text-yellow-600";
    case "CONFIRMED":
      return bg ? "bg-indigo-400" : "text-indigo-600"; // New Color
    case "PROCESSING":
      return bg ? "bg-blue-400" : "text-blue-600";
    case "SHIPPED":
      return bg ? "bg-purple-400" : "text-purple-600";
    case "DELIVERED":
      return bg ? "bg-green-400" : "text-green-600";
    case "CANCELLED":
      return bg ? "bg-red-400" : "text-red-600";
    default:
      return bg ? "bg-gray-400" : "text-gray-600";
  }
}
