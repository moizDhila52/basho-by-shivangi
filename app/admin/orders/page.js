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
  MoreVertical,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Bashō Color Palette
const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const STATUS_FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [dateRange, setDateRange] = useState("all");

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "ALL" || order.status === selectedStatus;
      const matchesSearch =
        searchQuery === "" ||
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by date range
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

  // Update Order Status
  const updateOrderStatus = async (orderId, newStatus) => {
    const oldOrders = [...orders];

    // Optimistic update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    setUpdatingOrder(orderId);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      const updatedOrder = await res.json();

      // Update with server response
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order:", error);
      // Revert on error
      setOrders(oldOrders);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // View Order Details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const processingOrders = orders.filter(
      (o) => o.status === "PROCESSING"
    ).length;
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    ).length;

    return {
      totalRevenue: totalRevenue.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      }),
      totalOrders,
      pendingOrders,
      processingOrders,
      todayOrders,
    };
  }, [orders]);

  const handlePrintInvoice = (order) => {
    window.open(`/admin/orders/${order.id}/invoice`, "_blank");
  };

  const handleExportOrders = () => {
    const csvData = filteredOrders.map((order) => ({
      "Order ID": order.orderNumber,
      Customer: order.customerName,
      Email: order.customerEmail,
      Phone: order.customerPhone,
      Amount: order.total,
      Status: order.status,
      Date: format(new Date(order.createdAt), "dd/MM/yyyy"),
      Items: order.OrderItem?.map(
        (item) => `${item.productName} x${item.quantity}`
      ).join(", "),
    }));

    const csv = convertToCSV(csvData);
    downloadCSV(csv, `orders-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => JSON.stringify(row[header])).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-[#C85428] rounded-full mx-auto mb-4"
          />
          <p className="text-[#8E5022] font-serif">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
            Order Management
          </h1>
          <p className="text-[#8E5022] mt-1">
            Manage customer orders and track fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#EDD8B4] text-[#8E5022] rounded-xl hover:bg-[#FDFBF7] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchOrders}
            className="p-2.5 border border-[#EDD8B4] rounded-xl hover:bg-[#FDFBF7] transition-colors text-[#8E5022]"
            title="Refresh orders"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-white to-[#FDFBF7] p-4 rounded-2xl border border-[#EDD8B4] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8E5022]">Total Revenue</p>
              <p className="text-2xl font-bold text-[#442D1C] mt-1">
                {stats.totalRevenue}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#C85428]/10 to-[#8E5022]/10">
              <Package className="w-6 h-6 text-[#C85428]" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-[#FDFBF7] p-4 rounded-2xl border border-[#EDD8B4] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8E5022]">Total Orders</p>
              <p className="text-2xl font-bold text-[#442D1C] mt-1">
                {stats.totalOrders}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#8E5022]/10 to-[#652810]/10">
              <ShoppingBag className="w-6 h-6 text-[#8E5022]" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-[#FDFBF7] p-4 rounded-2xl border border-[#EDD8B4] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8E5022]">Pending Orders</p>
              <p className="text-2xl font-bold text-[#442D1C] mt-1">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10">
              <Clock className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-[#FDFBF7] p-4 rounded-2xl border border-[#EDD8B4] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8E5022]">Today's Orders</p>
              <p className="text-2xl font-bold text-[#442D1C] mt-1">
                {stats.todayOrders}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10">
              <Calendar className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-2xl border border-[#EDD8B4] shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E5022]" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] w-full transition-all text-[#442D1C]"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] text-[#442D1C] cursor-pointer min-w-[180px]"
              >
                <option value="all">All Time</option>
                <option value="1">Today</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8E5022] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "ALL",
            "PENDING",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedStatus === status
                  ? "bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white shadow-md"
                  : "bg-white text-[#8E5022] border border-[#EDD8B4] hover:border-[#C85428] hover:text-[#C85428]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-[#EDD8B4] shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/30 border-b border-[#EDD8B4]">
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Order ID
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Customer
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Date
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Items
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Amount
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDD8B4]/30">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#FDFBF7] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="font-mono text-sm font-bold text-[#442D1C]">
                      #{order.orderNumber}
                    </div>
                    <div className="text-xs text-[#8E5022] mt-1">
                      {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="font-medium text-[#442D1C]">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-[#8E5022]">
                        {order.customerEmail}
                      </div>
                      {order.customerPhone && (
                        <div className="text-xs text-[#8E5022] flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {order.customerPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#442D1C]">
                    {format(new Date(order.createdAt), "MMM dd")}
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {order.OrderItem?.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-[#442D1C] truncate max-w-[150px]">
                            {item.productName}
                          </span>
                          <span className="text-[#8E5022] font-medium">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.OrderItem?.length > 2 && (
                        <div className="text-xs text-[#C85428] font-medium">
                          +{order.OrderItem.length - 2} more items
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-lg text-[#442D1C]">
                      ₹{order.total?.toLocaleString()}
                    </div>
                    {order.shippingCost > 0 && (
                      <div className="text-xs text-[#8E5022]">
                        Shipping: ₹{order.shippingCost}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <StatusBadge status={order.status} />
                      <div className="flex space-x-1">
                        {STATUS_FLOW.map((status, index) => (
                          <div
                            key={status}
                            className={`h-1 flex-1 rounded-full ${
                              STATUS_FLOW.indexOf(order.status) >= index
                                ? status === "PENDING"
                                  ? "bg-yellow-400"
                                  : status === "PROCESSING"
                                  ? "bg-blue-400"
                                  : status === "SHIPPED"
                                  ? "bg-purple-400"
                                  : "bg-green-400"
                                : "bg-[#EDD8B4]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="p-2 text-[#8E5022] hover:text-[#C85428] hover:bg-[#EDD8B4]/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={updatingOrder === order.id}
                        className="bg-white border border-[#EDD8B4] text-[#442D1C] text-sm rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#C85428] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="p-2 text-[#8E5022] hover:text-[#C85428] hover:bg-[#EDD8B4]/20 rounded-lg transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                    {updatingOrder === order.id && (
                      <div className="mt-2 text-xs text-[#8E5022] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-[#EDD8B4] mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-2">
              No orders found
            </h3>
            <p className="text-[#8E5022]">
              {selectedStatus !== "ALL"
                ? `No ${selectedStatus.toLowerCase()} orders found`
                : "Try adjusting your search filters"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-[#EDD8B4] bg-gradient-to-r from-[#FDFBF7] to-white">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#442D1C]">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-[#8E5022]">
                    {format(
                      new Date(selectedOrder.createdAt),
                      "MMMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-[#EDD8B4]/20 transition-colors"
                >
                  <X className="w-5 h-5 text-[#8E5022]" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                        Customer Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#8E5022]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#442D1C]">
                              {selectedOrder.customerName}
                            </div>
                            <div className="text-sm text-[#8E5022]">
                              {selectedOrder.customerEmail}
                            </div>
                          </div>
                        </div>

                        {selectedOrder.customerPhone && (
                          <div className="flex items-center gap-2 text-[#442D1C]">
                            <Phone className="w-4 h-4 text-[#8E5022]" />
                            {selectedOrder.customerPhone}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[#442D1C]">
                          <Mail className="w-4 h-4 text-[#8E5022]" />
                          {selectedOrder.customerEmail}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                        Shipping Address
                      </h3>
                      <div className="space-y-2 text-[#442D1C]">
                        {selectedOrder.address &&
                        typeof selectedOrder.address === "object" ? (
                          <>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-[#8E5022] mt-0.5" />
                              <div>
                                <div>{selectedOrder.address.street}</div>
                                <div>
                                  {selectedOrder.address.city},{" "}
                                  {selectedOrder.address.state}
                                </div>
                                <div>
                                  {selectedOrder.address.pincode},{" "}
                                  {selectedOrder.address.country}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-[#8E5022] italic">
                            No address provided
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-[#442D1C] border-b border-[#EDD8B4] pb-2">
                      Order Items ({selectedOrder.OrderItem?.length || 0})
                    </h3>
                    <div className="bg-[#FDFBF7] rounded-xl border border-[#EDD8B4] overflow-hidden">
                      {selectedOrder.OrderItem?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border-b border-[#EDD8B4]/30 last:border-b-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-b from-[#EDD8B4] to-[#FDFBF7] rounded-lg overflow-hidden">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-full h-full p-4 text-[#EDD8B4]" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-[#442D1C]">
                                {item.productName}
                              </div>
                              <div className="text-sm text-[#8E5022]">
                                {item.productSlug}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#442D1C]">
                              ₹{item.price}
                            </div>
                            <div className="text-sm text-[#8E5022]">
                              Qty: {item.quantity}
                            </div>
                            <div className="font-medium text-[#442D1C] mt-1">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-white to-[#FDFBF7] rounded-xl border border-[#EDD8B4] p-6">
                    <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4">
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[#442D1C]">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          ₹{selectedOrder.subtotal?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#442D1C]">
                        <span>Shipping</span>
                        <span className="font-medium">
                          ₹{selectedOrder.shippingCost?.toFixed(2)}
                        </span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">
                            -₹{selectedOrder.discount?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {selectedOrder.tax > 0 && (
                        <div className="flex justify-between text-[#442D1C]">
                          <span>Tax</span>
                          <span className="font-medium">
                            ₹{selectedOrder.tax?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-[#EDD8B4] pt-3">
                        <div className="flex justify-between font-bold text-lg text-[#442D1C]">
                          <span>Total</span>
                          <span>₹{selectedOrder.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between p-6 border-t border-[#EDD8B4] bg-[#FDFBF7]">
                  <div>
                    <StatusBadge status={selectedOrder.status} size="lg" />
                    <div className="text-xs text-[#8E5022] mt-2">
                      Last updated:{" "}
                      {format(
                        new Date(selectedOrder.updatedAt),
                        "MMM dd, HH:mm"
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#EDD8B4] text-[#8E5022] rounded-xl hover:bg-[#EDD8B4]/20 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Print Invoice
                    </button>
                    <button
                      onClick={() =>
                        window.open(`/orders/${selectedOrder.id}`, "_blank")
                      }
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Order Page
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status, size = "md" }) {
  const getConfig = (status) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: <Clock className="w-3 h-3" />,
        };
      case "PROCESSING":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Package className="w-3 h-3" />,
        };
      case "SHIPPED":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Truck className="w-3 h-3" />,
        };
      case "DELIVERED":
        return {
          color: "bg-green-50 text-green-700 border-green-200",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "CANCELLED":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <AlertCircle className="w-3 h-3" />,
        };
      default:
        return {
          color: "bg-[#EDD8B4]/30 text-[#8E5022] border-[#EDD8B4]",
          icon: <AlertCircle className="w-3 h-3" />,
        };
    }
  };

  const config = getConfig(status);
  const sizeClass = size === "lg" ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClass}`}
    >
      {config.icon}
      {status}
    </span>
  );
}

// Mock component (replace with actual import)
const ShoppingBag = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);
const X = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
