'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut,
  ChevronRight,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// Ensure this path points to where your ProfileForm is located
import ProfileForm from '@/app/profile/ProfileForm'; 
// Use your custom AuthProvider
import { useAuth } from '@/components/AuthProvider';

export default function ProfileContent({ user, stats, allOrders, activeOrderTracker }) {
  // 'overview' | 'orders' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get the logout function from your custom hook
  const { logout } = useAuth();

  // --- Sub-Components ---

  // 1. Mobile Bottom Navigation
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50 pb-safe safe-area-bottom">
      <button 
        onClick={() => setActiveTab('overview')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-[#8E5022]' : 'text-stone-400'}`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-bold">Overview</span>
      </button>
      <button 
        onClick={() => setActiveTab('orders')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'orders' ? 'text-[#8E5022]' : 'text-stone-400'}`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] font-bold">Orders</span>
      </button>
      <button 
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-[#8E5022]' : 'text-stone-400'}`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-bold">Settings</span>
      </button>
    </div>
  );

  // 2. Order Card (Mobile Friendly)
  const OrderCard = ({ order }) => (
    <Link href={`/profile/orders/${order.id}`} className="block">
      <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm mb-3 active:scale-[0.98] transition-transform">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-[#442D1C] text-sm">
              Order #{order.orderNumber?.slice(-8) || order.id.slice(-6).toUpperCase()}
            </p>
            <p className="text-[10px] text-stone-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {order.status}
          </span>
        </div>
        <div className="flex gap-3 items-center border-t border-stone-50 pt-3">
          <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center flex-shrink-0">
             <Package className="w-5 h-5 text-stone-400" />
          </div>
          <div className="flex-1">
             <p className="text-xs text-stone-600 line-clamp-1">
               {order.OrderItem.map(i => i.productName).join(', ')}
             </p>
             <p className="text-[10px] text-stone-400">{order.OrderItem.length} Items</p>
          </div>
          <div className="text-right">
             <p className="font-bold text-[#442D1C]">₹{order.total}</p>
             <div className="flex items-center text-[10px] text-[#8E5022] justify-end gap-0.5">
               View <ChevronRight className="w-3 h-3" />
             </div>
          </div>
        </div>
      </div>
    </Link>
  );

  // --- CONTENT VIEWS ---

  const OverviewView = () => (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* STATS GRID:
         - Mobile: 2 Columns (2x2), Vertical Stack, Compact, No Scroll
         - Desktop: 3 Columns, Horizontal Row, Spacious
      */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white p-3 md:p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left transition-all"
          >
            {/* Icon Wrapper */}
            <div className="p-2 md:p-3 rounded-xl bg-[#8E5022]/10 text-[#8E5022] flex-shrink-0">
              <div className="w-5 h-5 md:w-6 md:h-6">
                {stat.icon}
              </div>
            </div>
            
            <div className="min-w-0 w-full">
              <p className="text-[10px] md:text-xs font-bold text-stone-500 uppercase tracking-wide truncate">
                {stat.label}
              </p>
              <h3 className="text-lg md:text-2xl font-serif text-[#442D1C] leading-none mt-1">
                {stat.value}
              </h3>
              
              {/* HIDE SUBTEXT ON MOBILE */}
              {stat.subtext && (
                <p className="hidden md:block text-xs text-stone-400 mt-1 truncate">
                  {stat.subtext}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tracker */}
      {activeOrderTracker}

      {/* Recent Activity (Mobile Preview) */}
      <div className="md:hidden">
        <h3 className="font-serif text-lg text-[#442D1C] mb-4">Recent Orders</h3>
        {allOrders.slice(0, 3).map(order => <OrderCard key={order.id} order={order} />)}
        <button 
          onClick={() => setActiveTab('orders')}
          className="w-full py-3 text-sm text-[#8E5022] font-bold border border-[#EDD8B4] rounded-xl mt-2"
        >
          View All History
        </button>
      </div>

      {/* Desktop Only: Activity List Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between">
           <h3 className="font-serif text-[#442D1C]">Recent Activity</h3>
           <button onClick={() => setActiveTab('orders')} className="text-xs text-[#8E5022] hover:underline">View All</button>
        </div>
        <div className="divide-y divide-stone-50">
           {allOrders.slice(0,5).map(order => (
             <div key={order.id} className="p-4 flex justify-between hover:bg-stone-50 transition-colors">
                <div className="flex gap-4 items-center">
                   <div className="p-2 bg-stone-100 rounded-lg"><Package className="w-4 h-4 text-stone-500"/></div>
                   <div>
                      <p className="text-sm font-bold text-[#442D1C]">Order #{order.orderNumber?.slice(-8) || order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold">₹{order.total}</p>
                   <p className="text-[10px] uppercase font-bold text-stone-500">{order.status}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  const OrdersView = () => (
    <div className="space-y-4 pb-24 md:pb-0">
      <h2 className="font-serif text-2xl text-[#442D1C] md:hidden mb-2">My Orders</h2>
      {allOrders.map(order => <OrderCard key={order.id} order={order} />)}
      {allOrders.length === 0 && (
        <div className="text-center py-12 text-stone-500">No orders found.</div>
      )}
    </div>
  );

  const SettingsView = () => (
    <div className="pb-24 md:pb-0">
      <h2 className="font-serif text-2xl text-[#442D1C] md:hidden mb-6">Account Settings</h2>
      
      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
        {/* 👇 WE REMOVED THE HEADER HERE to avoid duplication */}
        
        {/* ProfileForm now contains the Avatar + Inputs */}
        <ProfileForm user={user} />
        
        <div className="mt-8 pt-8 border-t border-stone-100">
           <button 
             onClick={logout}
             className="w-full flex items-center justify-center gap-2 text-red-600 py-3 bg-red-50 rounded-xl font-medium hover:bg-red-100 transition-colors"
           >
             <LogOut className="w-4 h-4" /> Log Out
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <MobileNav />
      
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Left Col */}
         <div className="xl:col-span-2">
            <OverviewView />
         </div>
         {/* Right Col */}
         <div className="xl:col-span-1">
            <SettingsView />
         </div>
      </div>

      {/* Mobile Tab Layout */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <OverviewView />
            </motion.div>
          )}
          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <OrdersView />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SettingsView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}