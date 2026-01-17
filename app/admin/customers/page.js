"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Mail,
  Calendar,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  Palette,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Gem,
  Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  
  // New Filter States
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'newsletter', 'buyers'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'most_orders', 'most_workshops'
  
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        filter: filterStatus,
        sort: sortBy,
        page: page.toString(),
        limit: limit.toString()
      });
      
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();

      if (data.data) {
        setCustomers(data.data);
        setMeta(data.meta || { total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, sortBy, page, limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, sortBy, limit]);

  return (
    <div className="space-y-6 font-sans p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C]">Customer Database</h1>
        <p className="text-[#8E5022] text-sm">
          Manage users, track workshop registrations, and monitor order history.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDD8B4] shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]/50" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4]/50 rounded-xl focus:ring-1 focus:ring-[#C85428] focus:border-[#C85428] text-[#442D1C] placeholder-[#8E5022]/40 text-sm outline-none transition-all"
          />
        </div>

        {/* Filters Container - Stacks on mobile */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Filter Dropdown */}
            <div className="relative flex-1 sm:flex-none items-center">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]" />
                <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-[#EDD8B4] rounded-xl text-sm font-medium text-[#442D1C] focus:outline-none focus:border-[#C85428] appearance-none cursor-pointer hover:bg-[#FDFBF7] transition-colors"
                >
                <option value="all">All Users</option>
                <option value="newsletter">Newsletter</option>
                <option value="buyers">Buyers</option>
                </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none items-center">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]" />
                <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-[#EDD8B4] rounded-xl text-sm font-medium text-[#442D1C] focus:outline-none focus:border-[#C85428] appearance-none cursor-pointer hover:bg-[#FDFBF7] transition-colors"
                >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_orders">Orders</option>
                <option value="most_workshops">Workshops</option>
                </select>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-[#EDD8B4] mx-1"></div>

          <button onClick={fetchCustomers} className="w-full sm:w-auto flex justify-center items-center p-2.5 hover:bg-[#FDFBF7] border border-[#EDD8B4] sm:border-transparent sm:hover:border-[#EDD8B4] rounded-xl text-[#8E5022] transition-all">
            <RefreshCw size={18} />
            <span className="sm:hidden ml-2 text-sm font-medium">Refresh List</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-transparent md:bg-white md:rounded-3xl md:border md:border-[#EDD8B4] md:shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#8E5022]">
            <div className="w-8 h-8 border-2 border-[#C85428] border-t-transparent rounded-full animate-spin mb-2" />
            Fetching Database...
          </div>
        ) : (
          <>
            {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#EDD8B4]/50 bg-[#FDFBF7]/80">
                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">User Profile</th>
                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Status</th>
                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Location</th>
                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Stats</th>
                    <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Total Value</th>
                    <th className="py-4 px-6 text-right text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FDFBF7]">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[#FDFBF7]/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[#442D1C] font-bold text-sm overflow-hidden relative ${
                            customer.isSubscribed ? 'ring-2 ring-emerald-400 bg-emerald-50' : 'bg-[#EDD8B4]/30'
                          }`}>
                            {customer.image ? (
                              <img src={customer.image} alt={customer.name} className="w-full h-full object-cover" />
                            ) : (
                              (customer.name?.[0] || customer.email?.[0] || "U").toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#442D1C] text-sm flex items-center gap-2">
                              {customer.name || "Guest User"}
                              {customer.isSubscribed && <Leaf size={12} className="text-emerald-500 fill-emerald-100" />}
                            </div>
                            <div className="text-xs text-[#8E5022] flex items-center gap-1">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {customer.isSubscribed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 gap-1">
                            <CheckCircle2 size={10} /> Subscribed
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-stone-50 text-stone-400 border border-stone-200">
                            Standard
                            </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-[#442D1C]">
                          {customer.address ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-[#C85428]" />
                              {customer.address.city}, {customer.address.country}
                            </div>
                          ) : (
                            <span className="text-xs text-[#8E5022]/60 italic pl-1">--</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium gap-1 ${
                              customer.orderCount > 0 ? "bg-[#FDFBF7] text-[#442D1C] border border-[#EDD8B4]" : "text-stone-400"
                          }`}>
                              <ShoppingBag size={12} /> {customer.orderCount}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium gap-1 ${
                              customer.workshopCount > 0 ? "bg-[#FDFBF7] text-[#442D1C] border border-[#EDD8B4]" : "text-stone-400"
                          }`}>
                              <Palette size={12} /> {customer.workshopCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#442D1C]">
                          <span className="text-[#8E5022] text-xs mr-0.5">₹</span>
                          {customer.totalSpent?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedUser(customer)}
                          className="p-2 hover:bg-[#EDD8B4]/20 rounded-full text-[#8E5022] transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#8E5022]">No customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE CARD VIEW (Shown on small screens) --- */}
            <div className="md:hidden space-y-4">
                {customers.map((customer) => (
                    <div key={customer.id} className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[#442D1C] font-bold text-lg overflow-hidden relative ${
                                    customer.isSubscribed ? 'ring-2 ring-emerald-400 bg-emerald-50' : 'bg-[#EDD8B4]/30'
                                }`}>
                                    {customer.image ? (
                                    <img src={customer.image} alt={customer.name} className="w-full h-full object-cover" />
                                    ) : (
                                    (customer.name?.[0] || customer.email?.[0] || "U").toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#442D1C] flex items-center gap-1.5">
                                        {customer.name || "Guest User"}
                                        {customer.isSubscribed && <Leaf size={14} className="text-emerald-500 fill-emerald-100" />}
                                    </h3>
                                    <p className="text-xs text-[#8E5022]">{customer.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(customer)}
                                className="p-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-[#8E5022]"
                            >
                                <Eye size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm border-t border-b border-[#FDFBF7] py-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-[#8E5022] font-semibold">Spent</span>
                                <span className="font-bold text-[#442D1C]">₹{customer.totalSpent?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-[#8E5022] font-semibold">Location</span>
                                <span className="text-[#442D1C] truncate">{customer.address ? customer.address.city : "N/A"}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                             <div className="flex gap-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium gap-1 ${
                                    customer.orderCount > 0 ? "bg-[#FDFBF7] text-[#442D1C] border border-[#EDD8B4]/50" : "text-stone-400 bg-stone-50"
                                }`}>
                                    <ShoppingBag size={12} /> {customer.orderCount} Orders
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium gap-1 ${
                                    customer.workshopCount > 0 ? "bg-[#FDFBF7] text-[#442D1C] border border-[#EDD8B4]/50" : "text-stone-400 bg-stone-50"
                                }`}>
                                    <Palette size={12} /> {customer.workshopCount} Workshops
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                 {customers.length === 0 && (
                    <div className="py-12 text-center text-[#8E5022] bg-white rounded-xl border border-[#EDD8B4]">
                        No customers found.
                    </div>
                  )}
            </div>
          </>
        )}

        {/* Footer Pagination */}
        <div className="p-4 md:border-t border-[#EDD8B4]/50 flex flex-col sm:flex-row items-center justify-between gap-4 md:bg-[#FDFBF7]/30 mt-4 md:mt-0 bg-white md:bg-transparent rounded-xl border md:border-0 border-[#EDD8B4] shadow-sm md:shadow-none">
          <p className="text-xs text-[#8E5022]">
            Showing <span className="font-bold">{customers.length}</span> of <span className="font-bold">{meta.total}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[#EDD8B4] hover:bg-white disabled:opacity-50 text-[#442D1C] bg-[#FDFBF7] md:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-[#442D1C] px-2">Page {page}</span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-2 rounded-lg border border-[#EDD8B4] hover:bg-white disabled:opacity-50 text-[#442D1C] bg-[#FDFBF7] md:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================== */}
      {/* MOBILE RESPONSIVE MODAL                        */}
      {/* ============================================== */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-[#442D1C]/30 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[#FFFCF8] rounded-t-2xl md:rounded-[32px] w-full max-w-5xl shadow-2xl flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] overflow-hidden transition-all duration-300 ${
                selectedUser.isSubscribed 
                  ? "md:border-4 md:border-emerald-500/30 md:ring-4 md:ring-emerald-500/10" 
                  : "md:border border-[#EDD8B4]"
              }`}
            >
              
              {/* TOP BAR */}
              <div className={`px-4 md:px-8 py-4 md:py-6 border-b flex items-start justify-between backdrop-blur-md sticky top-0 z-20 shrink-0 ${
                 selectedUser.isSubscribed ? "bg-emerald-50/50 border-emerald-100" : "bg-white/50 border-[#EDD8B4]/30"
              }`}>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full md:w-auto">
                  
                  {/* Avatar */}
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-[#442D1C] text-2xl md:text-3xl font-bold overflow-hidden shadow-inner shrink-0 ${
                    selectedUser.isSubscribed ? "bg-emerald-200" : "bg-[#EDD8B4]"
                  }`}>
                    {selectedUser.image ? (
                      <img src={selectedUser.image} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      (selectedUser.name?.[0] || "U").toUpperCase()
                    )}
                  </div>

                  {/* Name & Quick Stats */}
                  <div className="text-center md:text-left w-full md:w-auto">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                      <h2 className="text-xl md:text-2xl font-serif font-bold text-[#442D1C]">{selectedUser.name || "Unknown Name"}</h2>
                      {selectedUser.isSubscribed && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-200 flex items-center gap-1">
                          <Leaf size={10} /> Subscriber
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-center md:justify-start items-center gap-3 mt-1 text-sm text-[#8E5022]">
                      <span className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${selectedUser.isSubscribed ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                          {selectedUser.role}
                      </span>
                      <span className="text-[#EDD8B4]">•</span>
                      <span className="font-mono text-xs opacity-70">{selectedUser.id.substring(0,8)}</span>
                    </div>

                    {/* Stats Row (Grid on mobile, Flex on desktop) */}
                    <div className="grid grid-cols-3 md:flex gap-2 md:gap-6 mt-4 md:mt-3 w-full border-t md:border-0 border-[#EDD8B4]/30 pt-3 md:pt-0">
                        <div className="text-center md:text-left">
                           <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-[#8E5022]/70">Lifetime</p>
                           <p className="text-sm md:text-base font-bold text-[#442D1C]">₹{selectedUser.totalSpent?.toLocaleString() || 0}</p>
                        </div>
                        <div className="md:pl-6 border-l md:border-l border-[#EDD8B4]/50 text-center md:text-left">
                           <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-[#8E5022]/70">Orders</p>
                           <p className="text-sm md:text-base font-bold text-[#442D1C]">{selectedUser.orderCount || 0}</p>
                        </div>
                        <div className="md:pl-6 border-l md:border-l border-[#EDD8B4]/50 text-center md:text-left">
                           <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-[#8E5022]/70">Workshops</p>
                           <p className="text-sm md:text-base font-bold text-[#442D1C]">{selectedUser.workshopCount || 0}</p>
                        </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 md:static p-2 bg-white hover:bg-[#EDD8B4]/20 rounded-full text-[#8E5022] transition-colors border border-[#EDD8B4]/30"
                >
                  <X size={20} />
                </button>
              </div>

              {/* SCROLLABLE BODY */}
              <div className="overflow-y-auto p-4 md:p-8 bg-[#FFFCF8] flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-8 md:pb-0">
                    
                    {/* COLUMN 1: Contact & Address */}
                    <div className="lg:col-span-1 space-y-4 md:space-y-6">
                      
                      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#EDD8B4]/30 shadow-sm">
                          <h3 className="text-xs font-bold text-[#442D1C] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Shield size={14} className="text-[#C85428]" /> 
                            Contact Info
                          </h3>
                          <div className="space-y-4">
                             <div className="flex gap-3 items-start">
                                <Mail size={16} className="text-[#8E5022] mt-0.5" />
                                <div className="min-w-0 flex-1">
                                   <p className="text-xs text-[#8E5022]">Email</p>
                                   <p className="text-sm font-medium text-[#442D1C] break-all">{selectedUser.email}</p>
                                </div>
                             </div>
                             <div className="flex gap-3 items-start">
                                <Phone size={16} className="text-[#8E5022] mt-0.5" />
                                <div>
                                   <p className="text-xs text-[#8E5022]">Phone</p>
                                   <p className="text-sm font-medium text-[#442D1C]">{selectedUser.phone || "N/A"}</p>
                                </div>
                             </div>
                          </div>
                      </div>

                      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#EDD8B4]/30 shadow-sm">
                          <h3 className="text-xs font-bold text-[#442D1C] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapPin size={14} className="text-[#C85428]" /> 
                            Primary Address
                          </h3>
                          {selectedUser.address ? (
                            <div className="text-sm text-[#442D1C] leading-relaxed">
                              <p className="font-medium">{selectedUser.address.street}</p>
                              <p>{selectedUser.address.city}, {selectedUser.address.state}</p>
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#EDD8B4]/20">
                                 <span className="text-[#8E5022]">{selectedUser.address.pincode}</span>
                                 <span className="font-bold">{selectedUser.address.country}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-[#8E5022]/60 italic bg-[#FDFBF7] p-3 rounded-lg text-center">
                              No address available
                            </div>
                          )}
                      </div>

                      <div className="px-2 grid grid-cols-2 lg:block gap-4">
                          <p className="text-xs text-[#8E5022] flex flex-col md:flex-row md:justify-between mb-1">
                             <span>Joined:</span>
                             <span className="font-medium text-[#442D1C]">{format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}</span>
                          </p>
                          <p className="text-xs text-[#8E5022] flex flex-col md:flex-row md:justify-between">
                             <span>Last Active:</span>
                             <span className="font-medium text-[#442D1C]">{selectedUser.lastLogin ? format(new Date(selectedUser.lastLogin), "MMM dd, HH:mm") : "Never"}</span>
                          </p>
                      </div>
                    </div>

                    {/* COLUMN 2 & 3: Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Purchases */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                           <h3 className="text-sm font-bold text-[#442D1C] flex items-center gap-2">
                              <ShoppingBag size={16} className="text-[#C85428]" /> 
                              Purchase History
                           </h3>
                           <span className="bg-[#FDFBF7] text-[#8E5022] px-2 py-0.5 rounded text-xs font-medium border border-[#EDD8B4]/50">
                              {selectedUser.products?.length || 0} Items
                           </span>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#EDD8B4]/30 shadow-sm overflow-hidden">
                           {selectedUser.products && selectedUser.products.length > 0 ? (
                             <div className="divide-y divide-[#FDFBF7]">
                               {selectedUser.products.map((item, idx) => (
                                 <div key={idx} className="p-4 flex items-center gap-3 md:gap-4 hover:bg-[#FDFBF7]/50 transition-colors">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#EDD8B4]/20 shrink-0">
                                       {item.image && <img src={item.image} className="w-full h-full object-cover rounded-lg" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="text-sm font-bold text-[#442D1C] truncate">{item.name}</h4>
                                       <p className="text-xs text-[#8E5022]">{format(new Date(item.date), "PPP")}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                       <p className="text-sm font-bold text-[#442D1C]">₹{item.price}</p>
                                       <p className="text-xs text-[#8E5022]">Qty: {item.quantity}</p>
                                    </div>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <div className="p-8 text-center text-[#8E5022]/60 text-sm">
                               No purchase history found.
                             </div>
                           )}
                        </div>
                      </div>

                      {/* Workshops */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                           <h3 className="text-sm font-bold text-[#442D1C] flex items-center gap-2">
                              <Palette size={16} className="text-[#C85428]" /> 
                              Registered Workshops
                           </h3>
                           <span className="bg-[#FDFBF7] text-[#8E5022] px-2 py-0.5 rounded text-xs font-medium border border-[#EDD8B4]/50">
                              {selectedUser.workshops?.length || 0} Enrolled
                           </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {selectedUser.workshops && selectedUser.workshops.length > 0 ? (
                             selectedUser.workshops.map((ws, idx) => (
                               <div key={idx} className="bg-white p-3 rounded-xl border border-[#EDD8B4]/30 flex gap-3 hover:shadow-md transition-shadow">
                                  <div className="w-12 h-12 rounded-lg bg-[#FDFBF7] flex items-center justify-center text-[#C85428] shrink-0 border border-[#EDD8B4]/20">
                                     <Calendar size={20} />
                                  </div>
                                  <div className="min-w-0">
                                     <h4 className="text-sm font-bold text-[#442D1C] truncate">{ws.title}</h4>
                                     <p className="text-xs text-[#8E5022] mt-0.5">{format(new Date(ws.date), "MMM dd, h:mm a")}</p>
                                     <span className="inline-block mt-2 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                                        Confirmed
                                     </span>
                                   </div>
                               </div>
                             ))
                           ) : (
                             <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-[#EDD8B4]/30 border-dashed text-center text-[#8E5022]/60 text-sm">
                               No workshops enrolled.
                             </div>
                           )}
                        </div>
                      </div>

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