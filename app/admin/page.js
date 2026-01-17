"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  Clock,
  Award,
  IndianRupee,
  Palette,
  Hammer,
  Receipt,
  ChevronRight,
  PackageOpen,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle,
  Activity,
  Truck,
  AlertCircle,
  CalendarDays,
  Package,
  Star,
  Sparkles,
  Search
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { useAdmin } from "@/context/AdminContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import Image from "next/image";

// Bashō Color Palette
const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
  white: "#FFFFFF",
};

// Payment type options
const PAYMENT_TYPES = [
  { value: "all", label: "All Transactions", icon: <Receipt className="w-4 h-4" /> },
  { value: "orders", label: "Store Orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { value: "custom", label: "Custom Requests", icon: <Hammer className="w-4 h-4" /> },
  { value: "workshops", label: "Workshops", icon: <Palette className="w-4 h-4" /> },
];

export default function AdminDashboard() {
  const { stats } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [paymentType, setPaymentType] = useState("all");
  const { refreshTrigger } = useNotification();
  
  // Initial State
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      activeWorkshops: 0,
      revenueChange: 0,
      ordersChange: 0,
      customersChange: 0,
    },
    revenueData: [],
    orderStatusData: [],
    topProducts: [],
    recentOrders: [],
    categoryData: [],
    dailyStats: {},
  });

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger.orders > 0) {
      fetchDashboardData(); 
    }
  }, [refreshTrigger.orders]);

  // Main data fetching function
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ 
        timeRange,
        paymentType 
      });
      const response = await fetch(`/api/admin/dashboard?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, paymentType]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-[#C85428] border-r-[#8E5022] rounded-full mx-auto mb-4"
          />
          <p className="text-[#8E5022] font-serif tracking-wide animate-pulse">
            Gathering Insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header with improved Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#442D1C] flex items-center gap-3">
            Dashboard Overview <Sparkles className="w-6 h-6 text-[#C85428]" />
          </h1>
          <p className="text-[#8E5022] mt-2 font-light">
            Here's what's happening with <strong>Basho</strong> today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto bg-white p-2 rounded-xl border border-[#EDD8B4] shadow-sm">
          {/* Payment Type Filter */}
          <div className="relative flex-grow md:flex-grow-0">
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full md:w-52 bg-[#FDFBF7] hover:bg-[#EDD8B4]/20 transition-colors border-0 text-sm px-4 py-3 pr-10 rounded-lg focus:ring-2 focus:ring-[#C85428] cursor-pointer text-[#442D1C] font-medium appearance-none"
            >
              {PAYMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#8E5022]">
              <Filter className="w-4 h-4" />
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="relative flex-grow md:flex-grow-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full md:w-44 bg-[#FDFBF7] hover:bg-[#EDD8B4]/20 transition-colors border-0 text-sm px-4 py-3 pr-10 rounded-lg focus:ring-2 focus:ring-[#C85428] cursor-pointer text-[#442D1C] font-medium appearance-none"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 3 Months</option>
              <option value="year">This Year</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#8E5022]">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-3 rounded-lg bg-[#C85428] text-white hover:bg-[#A0401C] transition-colors shadow-md hover:shadow-lg active:scale-95 duration-200"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Improved Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${dashboardData.summary.totalRevenue.toLocaleString()}`}
          change={dashboardData.summary.revenueChange}
          isPositive={parseFloat(dashboardData.summary.revenueChange) >= 0}
          icon={<BarChart3 className="w-6 h-6" />}
          variant="terracotta"
          delay={0}
          description="Gross earnings"
        />
        <StatCard
          title="Total Orders"
          value={dashboardData.summary.totalOrders.toLocaleString()}
          change={dashboardData.summary.ordersChange}
          isPositive={parseFloat(dashboardData.summary.ordersChange) >= 0}
          icon={<PackageOpen className="w-6 h-6" />}
          variant="clay"
          delay={100}
          description="Completed sales"
        />
        <StatCard
          title="Active Customers"
          value={dashboardData.summary.totalCustomers.toLocaleString()}
          change={dashboardData.summary.customersChange}
          isPositive={parseFloat(dashboardData.summary.customersChange) >= 0}
          icon={<Users className="w-6 h-6" />}
          variant="brown"
          delay={200}
          description="Unique buyers"
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${dashboardData.summary.avgOrderValue.toFixed(0)}`}
          change={null} // Don't show change if irrelevant
          isPositive={true}
          icon={<Layers className="w-6 h-6" />}
          variant="dark"
          delay={300}
          description="Per transaction"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDD8B4]"
        >
          <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="font-serif text-xl font-bold text-[#442D1C]">Financial Performance</h3>
               <p className="text-xs text-[#8E5022]">Revenue vs Order Volume</p>
             </div>
             {/* Legend */}
             <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-[#C85428]"></div> Revenue
                </div>
                <div className="flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-[#8E5022]"></div> Orders
                </div>
             </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C85428" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C85428" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDD8B4" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#8E5022', fontSize: 11}} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#8E5022', fontSize: 11}} 
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false} 
                  tickLine={false} 
                  hide={true}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EDD8B4",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    color: "#442D1C"
                  }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#C85428" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Line 
                   yAxisId="right"
                   type="monotone" 
                   dataKey="orders" 
                   stroke="#8E5022" 
                   strokeWidth={2} 
                   dot={{fill: '#8E5022', r: 3}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDD8B4] flex flex-col"
        >
           <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-1">Inventory Distribution</h3>
           <p className="text-xs text-[#8E5022] mb-6">Products by category</p>
           
           <div className="flex-1 min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#EDD8B4",
                        borderRadius: "8px",
                        color: "#442D1C"
                      }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <span className="block text-2xl font-bold text-[#442D1C]">{dashboardData.summary.totalProducts}</span>
                 <span className="text-[10px] text-[#8E5022] uppercase tracking-wider">Products</span>
              </div>
           </div>
           
           {/* Custom Legend */}
           <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {dashboardData.categoryData.map((cat, i) => (
                 <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}}></div>
                    <span className="text-[#442D1C] truncate">{cat.category}</span>
                    <span className="text-[#8E5022] font-medium ml-auto">{cat.count}</span>
                 </div>
              ))}
           </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Status Bars */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDD8B4]"
        >
           <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-6">Order Status</h3>
           <div className="space-y-5">
              {dashboardData.orderStatusData.map((status, index) => (
                 <div key={index} className="group">
                    <div className="flex justify-between items-center mb-1 text-sm">
                       <span className="font-medium text-[#442D1C] capitalize">{status.status.replace('_', ' ').toLowerCase()}</span>
                       <span className="text-[#8E5022] bg-[#FDFBF7] px-2 py-0.5 rounded-md text-xs border border-[#EDD8B4] group-hover:border-[#C85428] transition-colors">
                          {status.count} orders
                       </span>
                    </div>
                    <div className="w-full h-2 bg-[#FDFBF7] rounded-full overflow-hidden border border-[#EDD8B4]/30">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(status.count / dashboardData.summary.totalOrders) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: status.color }}
                       />
                    </div>
                 </div>
              ))}
           </div>
        </motion.div>

        {/* Improved Recent Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#EDD8B4]"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#442D1C]">Recent Transactions</h3>
              <p className="text-xs text-[#8E5022]">Latest activity from {paymentType === 'all' ? 'all sources' : paymentType}</p>
            </div>
            <Link 
              href="/admin/orders" 
              className="flex items-center gap-1 text-sm font-medium text-[#C85428] hover:text-[#A0401C] transition-colors group"
            >
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDD8B4]">
                  <th className="text-left py-4 px-4 text-[#8E5022] font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left py-4 px-4 text-[#8E5022] font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-4 text-[#8E5022] font-semibold text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-4 text-[#8E5022] font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map((order, i) => (
                  <tr key={order.id || i} className="group hover:bg-[#FDFBF7] transition-colors border-b border-[#EDD8B4]/30 last:border-0">
                    <td className="py-4 px-4">
                      {/* IMPROVED USER PROFILE */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                              order.user?.isSubscribed 
                                ? "bg-gradient-to-br from-[#C85428] to-[#8E5022] text-white" 
                                : "bg-[#EDD8B4] text-[#442D1C]"
                           }`}>
                             {order.user?.image ? (
                                <img src={order.user.image} alt="" className="w-full h-full rounded-full object-cover border-2 border-white" />
                             ) : (
                                <span>{getInitials(order.customerName || order.user?.name || "Guest")}</span>
                             )}
                           </div>
                           {order.user?.isSubscribed && (
                             <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border-2 border-white" title="Subscribed Member">
                                <Star className="w-2.5 h-2.5 fill-current" />
                             </div>
                           )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#442D1C] text-sm flex items-center gap-2">
                             {order.customerName || order.user?.name || "Guest Customer"}
                          </span>
                          <span className="text-[11px] text-[#8E5022] opacity-80">
                            {order.customerEmail || order.user?.email || "No email provided"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                       <div className="flex flex-col">
                          <span className="text-sm text-[#442D1C] font-medium">{format(new Date(order.createdAt), "MMM dd")}</span>
                          <span className="text-xs text-[#8E5022]">{format(new Date(order.createdAt), "hh:mm a")}</span>
                       </div>
                    </td>
                    <td className="py-4 px-4">
                       <span className="font-bold text-[#442D1C]">₹{order.total?.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dashboardData.recentOrders.length === 0 && (
               <div className="text-center py-10 text-[#8E5022] italic">No transactions found for this period.</div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <QuickStat title="Today's Revenue" value={`₹${dashboardData.dailyStats.todayRevenue?.toLocaleString() || 0}`} icon={<IndianRupee className="w-4 h-4"/>} />
         <QuickStat title="Pending Orders" value={dashboardData.summary.pendingOrders} icon={<Clock className="w-4 h-4"/>} isAlert={dashboardData.summary.pendingOrders > 0} />
         <QuickStat title="Workshops" value={dashboardData.summary.activeWorkshops} icon={<Award className="w-4 h-4"/>} />
         <QuickStat title="Total Products" value={dashboardData.summary.totalProducts} icon={<Package className="w-4 h-4"/>} />
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

// 1. IMPROVED STAT CARD WITH GLASSY ICON DIV
function StatCard({ title, value, change, isPositive, icon, variant = "clay", delay, description }) {
  // Variant colors for the icon background
  const variants = {
    terracotta: "from-[#C85428] to-[#A0401C] shadow-[#C85428]/20 text-white",
    clay: "from-[#8E5022] to-[#652810] shadow-[#8E5022]/20 text-white",
    brown: "from-[#652810] to-[#442D1C] shadow-[#652810]/20 text-white",
    dark: "from-[#442D1C] to-[#2A1B10] shadow-[#442D1C]/20 text-white",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDD8B4] hover:shadow-md transition-all duration-300 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="z-10">
          <p className="text-sm font-medium text-[#8E5022] mb-1">{title}</p>
          <h3 className="text-3xl font-serif font-bold text-[#442D1C] tracking-tight">{value}</h3>
          
          <div className="flex items-center gap-2 mt-3">
             {change !== null && (
               <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  isPositive 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
               }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {change}%
               </span>
             )}
             <span className="text-xs text-[#8E5022]/70">{description}</span>
          </div>
        </div>
        
        {/* IMPROVED DIV ICON */}
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${variants[variant]} shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
           {icon}
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#EDD8B4]/10 rounded-full blur-2xl group-hover:bg-[#EDD8B4]/20 transition-colors"></div>
    </motion.div>
  );
}

// 2. STATUS BADGE
function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
      case "CONFIRMED":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle className="w-3 h-3" /> };
      case "PROCESSING":
      case "IN_PROGRESS":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <Activity className="w-3 h-3" /> };
      case "SHIPPED":
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: <Truck className="w-3 h-3" /> };
      case "PENDING":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <Clock className="w-3 h-3" /> };
      case "CANCELLED":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <AlertCircle className="w-3 h-3" /> };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {status}
    </span>
  );
}

// 3. QUICK STAT FOOTER
function QuickStat({ title, value, icon, isAlert }) {
   return (
      <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
         isAlert ? "bg-red-50 border-red-200" : "bg-white border-[#EDD8B4] hover:border-[#C85428]"
      }`}>
         <div className={`p-2 rounded-lg ${isAlert ? "bg-red-100 text-red-600" : "bg-[#FDFBF7] text-[#8E5022]"}`}>
            {icon}
         </div>
         <div>
            <p className="text-xs text-[#8E5022] font-medium">{title}</p>
            <p className="text-lg font-bold text-[#442D1C]">{value}</p>
         </div>
      </div>
   )
}

// 4. UTILS
function getInitials(name) {
   return name
     .split(' ')
     .map(n => n[0])
     .join('')
     .toUpperCase()
     .substring(0, 2);
}