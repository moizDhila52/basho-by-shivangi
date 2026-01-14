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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-bold text-[#442D1C]">Customer Database</h1>
        <p className="text-[#8E5022] text-sm">
          Manage users, track workshop registrations, and monitor order history.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDD8B4] shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]/50" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4]/50 rounded-xl focus:ring-1 focus:ring-[#C85428] focus:border-[#C85428] text-[#442D1C] placeholder-[#8E5022]/40 text-sm outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          
          {/* Filter Dropdown */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-4 h-4 text-[#8E5022]" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-[#EDD8B4] rounded-xl text-sm font-medium text-[#442D1C] focus:outline-none focus:border-[#C85428] appearance-none cursor-pointer hover:bg-[#FDFBF7] transition-colors"
            >
              <option value="all">All Users</option>
              <option value="newsletter">Newsletter Subscribers</option>
              <option value="buyers">Verified Buyers</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-4 h-4 text-[#8E5022]" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-[#EDD8B4] rounded-xl text-sm font-medium text-[#442D1C] focus:outline-none focus:border-[#C85428] appearance-none cursor-pointer hover:bg-[#FDFBF7] transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_orders">Highest Orders</option>
              <option value="most_workshops">Highest Workshops</option>
            </select>
          </div>

          <div className="h-8 w-px bg-[#EDD8B4] mx-1 hidden sm:block"></div>

          <button onClick={fetchCustomers} className="p-2.5 hover:bg-[#FDFBF7] border border-transparent hover:border-[#EDD8B4] rounded-xl text-[#8E5022] transition-all">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-[#EDD8B4] shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#8E5022]">
            <div className="w-8 h-8 border-2 border-[#C85428] border-t-transparent rounded-full animate-spin mb-2" />
            Fetching Database...
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                            <img 
                              src={customer.image} 
                              alt={customer.name} 
                              className="w-full h-full object-cover" 
                            />
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
                              customer.orderCount > 0
                              ? "bg-[#FDFBF7] text-[#442D1C] border border-[#EDD8B4]"
                              : "text-stone-400"
                          }`}>
                              <ShoppingBag size={12} /> {customer.orderCount}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium gap-1 ${
                              customer.workshopCount > 0
                              ? "bg-[#FDFBF7] text-[#442D1C] border border-[#EDD8B4]"
                              : "text-stone-400"
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
                    <td colSpan={6} className="py-12 text-center text-[#8E5022]">
                      No customers found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="p-4 border-t border-[#EDD8B4]/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FDFBF7]/30">
          <p className="text-xs text-[#8E5022]">
            Showing <span className="font-bold">{customers.length}</span> of <span className="font-bold">{meta.total}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[#EDD8B4] hover:bg-white disabled:opacity-50 text-[#442D1C]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-[#442D1C] px-2">Page {page}</span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-2 rounded-lg border border-[#EDD8B4] hover:bg-white disabled:opacity-50 text-[#442D1C]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================== */}
      {/* IMPROVED MODAL WITH NEWSLETTER THEME           */}
      {/* ============================================== */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/20 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              // Logic for Green Frame based on Subscription
              className={`bg-[#FFFCF8] rounded-[32px] w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ${
                selectedUser.isSubscribed 
                  ? "border-4 border-emerald-500/30 ring-4 ring-emerald-500/10" 
                  : "border border-[#EDD8B4]"
              }`}
            >
              
              {/* TOP BAR */}
              <div className={`px-8 py-6 border-b flex items-start justify-between backdrop-blur-md sticky top-0 z-20 ${
                 selectedUser.isSubscribed ? "bg-emerald-50/50 border-emerald-100" : "bg-white/50 border-[#EDD8B4]/30"
              }`}>
                <div className="flex items-center gap-6">
                  
                  {/* Avatar */}
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-[#442D1C] text-3xl font-bold overflow-hidden shadow-inner shrink-0 ${
                    selectedUser.isSubscribed ? "bg-emerald-200" : "bg-[#EDD8B4]"
                  }`}>
                    {selectedUser.image ? (
                      <img src={selectedUser.image} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      (selectedUser.name?.[0] || "U").toUpperCase()
                    )}
                  </div>

                  {/* Name & Quick Stats */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-serif font-bold text-[#442D1C]">{selectedUser.name || "Unknown Name"}</h2>
                      {selectedUser.isSubscribed && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-200 flex items-center gap-1">
                          <Leaf size={10} /> Subscriber
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-sm text-[#8E5022]">
                      <span className="flex items-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full ${selectedUser.isSubscribed ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                         {selectedUser.role}
                      </span>
                      <span className="text-[#EDD8B4]">•</span>
                      <span className="font-mono text-xs opacity-70">{selectedUser.id.substring(0,8)}</span>
                    </div>

                    <div className="flex gap-6 mt-3">
                       <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-[#8E5022]/70">Lifetime Value</p>
                          <p className="text-base font-bold text-[#442D1C]">₹{selectedUser.totalSpent?.toLocaleString() || 0}</p>
                       </div>
                       <div className="pl-6 border-l border-[#EDD8B4]/50">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-[#8E5022]/70">Total Orders</p>
                          <p className="text-base font-bold text-[#442D1C]">{selectedUser.orderCount || 0}</p>
                       </div>
                       <div className="pl-6 border-l border-[#EDD8B4]/50">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-[#8E5022]/70">Workshops</p>
                          <p className="text-base font-bold text-[#442D1C]">{selectedUser.workshopCount || 0}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 bg-white hover:bg-[#EDD8B4]/20 rounded-full text-[#8E5022] transition-colors border border-[#EDD8B4]/30"
                >
                  <X size={20} />
                </button>
              </div>

              {/* SCROLLABLE BODY */}
              <div className="overflow-y-auto p-8 bg-[#FFFCF8]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   
                   {/* COLUMN 1: Contact & Address */}
                   <div className="lg:col-span-1 space-y-6">
                      
                      <div className="bg-white p-5 rounded-2xl border border-[#EDD8B4]/30 shadow-sm">
                         <h3 className="text-xs font-bold text-[#442D1C] uppercase tracking-wider mb-4 flex items-center gap-2">
                           <Shield size={14} className="text-[#C85428]" /> 
                           Contact Info
                         </h3>
                         <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                               <Mail size={16} className="text-[#8E5022] mt-0.5" />
                               <div>
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

                      <div className="bg-white p-5 rounded-2xl border border-[#EDD8B4]/30 shadow-sm">
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

                      <div className="px-2">
                         <p className="text-xs text-[#8E5022] flex justify-between mb-1">
                            <span>Joined:</span>
                            <span className="font-medium text-[#442D1C]">{format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}</span>
                         </p>
                         <p className="text-xs text-[#8E5022] flex justify-between">
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
                                 <div key={idx} className="p-4 flex items-center gap-4 hover:bg-[#FDFBF7]/50 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-[#EDD8B4]/20 shrink-0">
                                       {item.image && <img src={item.image} className="w-full h-full object-cover rounded-lg" />}
                                    </div>
                                    <div className="flex-1">
                                       <h4 className="text-sm font-bold text-[#442D1C]">{item.name}</h4>
                                       <p className="text-xs text-[#8E5022]">{format(new Date(item.date), "PPP")}</p>
                                    </div>
                                    <div className="text-right">
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
                             <div className="col-span-2 bg-white p-6 rounded-xl border border-[#EDD8B4]/30 border-dashed text-center text-[#8E5022]/60 text-sm">
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