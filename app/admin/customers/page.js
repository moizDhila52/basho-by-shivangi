"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  TrendingUp,
  ChevronDown,
  MoreVertical,
  Eye,
  MessageSquare,
  Filter,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(query) ||
          customer.email?.toLowerCase().includes(query) ||
          customer.phone?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "orders":
        result.sort(
          (a, b) => (b._count?.orders || 0) - (a._count?.orders || 0)
        );
        break;
      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
    }

    return result;
  }, [customers, searchQuery, sortBy]);

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const calculateStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(
      (c) => (c._count?.orders || 0) > 0
    ).length;
    const totalOrders = customers.reduce(
      (sum, c) => sum + (c._count?.orders || 0),
      0
    );
    const avgOrdersPerCustomer =
      totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalOrders,
      avgOrdersPerCustomer,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-[#C85428] rounded-full mx-auto mb-4"
          />
          <p className="text-[#8E5022] font-serif">Loading customers...</p>
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
            Customer Insights
          </h1>
          <p className="text-[#8E5022] mt-1">
            Manage and analyze your customer base
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            className="p-2.5 border border-[#EDD8B4] rounded-xl hover:bg-[#FDFBF7] transition-colors text-[#8E5022]"
            title="Refresh customers"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              /* Implement export */
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#EDD8B4] text-[#8E5022] rounded-xl hover:bg-[#FDFBF7] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
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
              <p className="text-sm text-[#8E5022]">Total Customers</p>
              <p className="text-2xl font-bold text-[#442D1C] mt-1">
                {stats.totalCustomers}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#C85428]/10 to-[#8E5022]/10">
              <User className="w-6 h-6 text-[#C85428]" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-[#FDFBF7] p-4 rounded-2xl border border-[#EDD8B4] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8E5022]">Active Customers</p>
              <p className="text-2xl font-bold text-[#442D1C] mt-1">
                {stats.activeCustomers}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#8E5022]/10 to-[#652810]/10">
              <TrendingUp className="w-6 h-6 text-[#8E5022]" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#652810]/10 to-[#442D1C]/10">
              <ShoppingBag className="w-6 h-6 text-[#652810]" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-[#FDFBF7] p-4 rounded-2xl border border-[#EDD8B4] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8E5022]">Avg Orders/Customer</p>
              <p className="text-2xl font-bold text-[#442D1C] mt-1">
                {stats.avgOrdersPerCustomer}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10">
              <TrendingUp className="w-6 h-6 text-[#10B981]" />
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
                placeholder="Search customers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] w-full transition-all text-[#442D1C]"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] text-[#442D1C] cursor-pointer min-w-[180px]"
              >
                <option value="recent">Most Recent</option>
                <option value="orders">Most Orders</option>
                <option value="name">Alphabetical</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8E5022] pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Customers Table */}
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
                  Customer
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Contact
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Orders
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#8E5022]">
                  Joined
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
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-[#FDFBF7] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EDD8B4] to-[#FDFBF7] flex items-center justify-center">
                        <span className="font-bold text-[#8E5022]">
                          {customer.name?.charAt(0)?.toUpperCase() ||
                            customer.email?.charAt(0)?.toUpperCase() ||
                            "G"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-[#442D1C]">
                          {customer.name || "Guest Customer"}
                        </div>
                        <div className="text-xs text-[#8E5022] mt-1">
                          ID: {customer.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#442D1C]">
                        <Mail className="w-3 h-3 text-[#8E5022]" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-[#442D1C]">
                          <Phone className="w-3 h-3 text-[#8E5022]" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (customer._count?.orders || 0) > 0
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-[#EDD8B4]/30 text-[#8E5022] border border-[#EDD8B4]"
                        }`}
                      >
                        {customer._count?.orders || 0} orders
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-[#442D1C]">
                      {format(new Date(customer.createdAt), "MMM dd, yyyy")}
                    </div>
                    <div className="text-xs text-[#8E5022]">
                      {format(new Date(customer.createdAt), "HH:mm")}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        customer._count?.orders > 0
                          ? "bg-[#C85428]/10 text-[#C85428] border border-[#C85428]/20"
                          : "bg-[#EDD8B4]/30 text-[#8E5022] border border-[#EDD8B4]"
                      }`}
                    >
                      {customer._count?.orders > 0 ? "Active" : "New"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewCustomerDetails(customer)}
                        className="p-2 text-[#8E5022] hover:text-[#C85428] hover:bg-[#EDD8B4]/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          /* Implement message */
                        }}
                        className="p-2 text-[#8E5022] hover:text-[#C85428] hover:bg-[#EDD8B4]/20 rounded-lg transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center">
            <User className="w-16 h-16 text-[#EDD8B4] mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-2">
              No customers found
            </h3>
            <p className="text-[#8E5022]">
              {searchQuery
                ? "No customers match your search"
                : "No customers registered yet"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Customer Details Modal (can be implemented similarly to orders modal) */}
    </div>
  );
}
