"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Debounce hook for search
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
  
  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // Wait 500ms before api call
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30); // Default 30 items
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        search: debouncedSearch,
        page: page.toString(),
        limit: limit.toString()
      });
      
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      
      if (data.data) {
        setCustomers(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset page when search or tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch, limit]);

  const TABS = [
    { id: "all", label: "All Users" },
    { id: "new", label: "New Users (30d)" },
    { id: "buyers", label: "Active Buyers" },
    { id: "active", label: "Recently Active" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
           <h1 className="font-serif text-3xl font-bold text-[#442D1C]">Customers</h1>
           <p className="text-[#8E5022] text-sm">
             View registered users and track their activity. <span className="text-[#C85428] font-bold">Read-only view.</span>
           </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#EDD8B4]">
        <div className="flex gap-8 overflow-x-auto">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                        activeTab === tab.id 
                        ? "text-[#C85428]" 
                        : "text-[#8E5022]/60 hover:text-[#8E5022]"
                    }`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div 
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C85428]"
                        />
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Controls: Search & Pagination Limit */}
      <div className="bg-white p-3 rounded-2xl border border-[#EDD8B4] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]/50" />
            <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-[#442D1C] placeholder-[#8E5022]/40 text-sm"
            />
         </div>
         
         <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E5022] font-medium whitespace-nowrap">Rows per page:</span>
                <select 
                    value={limit} 
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-[#FDFBF7] border border-[#EDD8B4] text-[#442D1C] text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C85428]"
                >
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <button onClick={fetchCustomers} className="p-2 hover:bg-[#FDFBF7] rounded-lg text-[#8E5022] transition-colors">
                <RefreshCw size={18} />
            </button>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-[#EDD8B4] shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-[#8E5022]">
              <div className="w-8 h-8 border-2 border-[#C85428] border-t-transparent rounded-full animate-spin mb-2" />
              Loading...
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#EDD8B4]/50 bg-[#FDFBF7]/50">
                  <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">User</th>
                  <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">First Sign In</th>
                  <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Last Active</th>
                  <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Activity</th>
                  <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Spent</th>
                  <th className="py-4 px-6 text-right text-[11px] font-bold uppercase tracking-wider text-[#8E5022]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDFBF7]">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FDFBF7]/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EDD8B4]/30 flex items-center justify-center text-[#442D1C] font-bold text-sm overflow-hidden">
                               {customer.image ? (
                                   <img src={customer.image} alt={customer.name} className="w-full h-full object-cover" />
                               ) : (
                                   (customer.name?.[0] || customer.email?.[0] || "U").toUpperCase()
                               )}
                          </div>
                          <div>
                              <div className="font-bold text-[#442D1C] text-sm">{customer.name || "Guest User"}</div>
                              <div className="text-xs text-[#8E5022] flex items-center gap-1">
                                  <Mail size={10} /> {customer.email}
                              </div>
                          </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-[#442D1C] font-medium">
                            <Calendar size={13} className="text-[#8E5022]" />
                            {format(new Date(customer.createdAt), "MMM dd, yyyy")}
                        </div>
                        <span className="text-[10px] text-[#8E5022]/60 pl-5">
                            {format(new Date(customer.createdAt), "hh:mm a")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-[#652810]">
                          <Clock size={13} className="text-[#8E5022]" />
                          {customer.lastLogin 
                              ? format(new Date(customer.lastLogin), "MMM dd, HH:mm") 
                              : <span className="text-xs opacity-50 italic">Never</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold gap-1 ${
                          customer.orderCount > 0 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-stone-50 text-stone-400 border border-stone-100"
                      }`}>
                          {customer.orderCount} Orders
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#442D1C] flex items-center">
                          <span className="text-[#8E5022] text-xs mr-0.5">$</span>
                          {customer.totalSpent?.toLocaleString()}
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
                            No customers found matching your criteria.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Footer Pagination */}
        <div className="p-4 border-t border-[#EDD8B4]/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8E5022]">
                Showing <span className="font-bold text-[#442D1C]">{customers.length}</span> of <span className="font-bold text-[#442D1C]">{meta.total}</span> users
            </p>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-[#EDD8B4] hover:bg-[#FDFBF7] disabled:opacity-50 text-[#442D1C] transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        // Simple logic to show active page
                        let pNum = i + 1;
                        if (meta.totalPages > 5 && page > 3) pNum = page - 2 + i;
                        if (pNum > meta.totalPages) return null;
                        
                        return (
                            <button
                                key={pNum}
                                onClick={() => setPage(pNum)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                                    page === pNum
                                    ? "bg-[#442D1C] text-[#EDD8B4]"
                                    : "hover:bg-[#FDFBF7] text-[#442D1C]"
                                }`}
                            >
                                {pNum}
                            </button>
                        );
                    })}
                </div>
                <button 
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                    className="p-2 rounded-lg border border-[#EDD8B4] hover:bg-[#FDFBF7] disabled:opacity-50 text-[#442D1C] transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
           <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
           >
              <motion.div
                 initial={{ scale: 0.95, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.95, y: 20 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                 <div className="relative h-24 bg-[#442D1C]">
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="absolute top-4 right-4 p-1.5 bg-white/10 rounded-full text-white hover:bg-white/20"
                    >
                        <X size={18} />
                    </button>
                 </div>
                 <div className="px-8 pb-8 -mt-10">
                    <div className="flex justify-between items-end mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md">
                            <div className="w-full h-full rounded-xl bg-[#EDD8B4] flex items-center justify-center text-[#442D1C] text-2xl font-bold overflow-hidden">
                                {selectedUser.image ? (
                                    <img src={selectedUser.image} className="w-full h-full object-cover" />
                                ) : selectedUser.name?.[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-[#FDFBF7] rounded-full text-xs font-bold text-[#8E5022] border border-[#EDD8B4]">
                                ID: {selectedUser.id.slice(0, 6)}...
                            </span>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-serif font-bold text-[#442D1C]">{selectedUser.name}</h2>
                    <p className="text-[#8E5022] flex items-center gap-1.5 text-sm mt-1">
                        <Mail size={14} /> {selectedUser.email}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EDD8B4]/50">
                            <p className="text-xs text-[#8E5022] uppercase font-bold tracking-wider mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-[#442D1C]">${selectedUser.totalSpent?.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EDD8B4]/50">
                            <p className="text-xs text-[#8E5022] uppercase font-bold tracking-wider mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-[#442D1C]">{selectedUser.orderCount}</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between py-3 border-b border-[#FDFBF7]">
                            <span className="text-sm text-[#8E5022] flex items-center gap-2"><MapPin size={16}/> Location</span>
                            <span className="text-sm font-bold text-[#442D1C]">{selectedUser.city !== "N/A" ? `${selectedUser.city}, ${selectedUser.country}` : "Unknown"}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#FDFBF7]">
                            <span className="text-sm text-[#8E5022] flex items-center gap-2"><Calendar size={16}/> Joined</span>
                            <span className="text-sm font-bold text-[#442D1C]">{format(new Date(selectedUser.createdAt), "PP")}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#FDFBF7]">
                            <span className="text-sm text-[#8E5022] flex items-center gap-2"><Clock size={16}/> Last Login</span>
                            <span className="text-sm font-bold text-[#442D1C]">
                                {selectedUser.lastLogin ? format(new Date(selectedUser.lastLogin), "PP p") : "Never"}
                            </span>
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