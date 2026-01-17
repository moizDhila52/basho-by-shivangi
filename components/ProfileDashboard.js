'use client';

import { useState } from 'react';
// Removed ProfileForm import
import {
  Package,
  Truck,
  ShoppingBag,
  Calendar,
  CheckCircle,
  MapPin,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';

// --- Reusable Sub-Components (Kept same as before) ---
function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="min-w-[240px] md:min-w-0 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4 snap-center flex-1">
      <div className="p-3 rounded-xl bg-[#8E5022]/10 text-[#8E5022]">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-serif text-[#442D1C]">{value}</h3>
        {subtext && <p className="text-xs text-stone-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

// (Assuming ActiveOrderTracker function is here as defined in previous turns)
// ... paste ActiveOrderTracker here if needed ...

// --- MAIN COMPONENT ---

export default function ProfileDashboard({ user, allOrders, activeOrders }) {
  // We no longer need tabs because settings is a separate page now
  // const [activeTab, setActiveTab] = useState('dashboard');

  const totalOrders = allOrders.length;
  const activeCount = activeOrders.length;
  const latestActiveOrder = activeOrders[0];
  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <div className="animate-in fade-in duration-500">
      {/* 📱 MOBILE HEADER (Simplified - No tabs) */}
      <div className="lg:hidden flex items-center gap-4 mb-8 pb-6 border-b border-stone-100">
        <div className="w-14 h-14 bg-[#EDD8B4] rounded-full flex items-center justify-center text-[#442D1C] font-serif font-bold text-xl overflow-hidden border border-[#EDD8B4]">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-serif text-[#442D1C]">
            Hello, {user.name?.split(' ')[0] || 'Guest'}
          </h1>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>
      </div>

      {/* 🖥️ DESKTOP HEADER */}
      <div className="hidden lg:block mb-8">
        <h1 className="text-3xl font-serif text-[#442D1C] mb-2">
          My Dashboard
        </h1>
        <p className="text-stone-500">
          Overview of your activity and collections.
        </p>
      </div>

      {/* --- MAIN CONTENT AREA (Expanded Width) --- */}
      {/*
         LAYOUT CHANGE:
         Removed the grid-cols-3 structure.
         This is now a single column stack that fills the available width.
      */}
      <div className="flex flex-col gap-6 items-start max-w-5xl">
        {/* Stats Swiper */}
        <div className="w-full flex flex-nowrap lg:grid lg:grid-cols-3 gap-4 overflow-x-auto pb-4 lg:pb-0 snap-x hide-scrollbar">
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={totalOrders}
            subtext="Clay treasures"
          />
          <StatCard
            icon={Truck}
            label="Active Shipments"
            value={activeCount}
            subtext={activeCount > 0 ? 'On the way' : 'No active orders'}
          />
          <StatCard
            icon={Calendar}
            label="Member Since"
            value={memberSince}
            subtext="Part of our journey"
          />
        </div>

        {/* Active Tracker & Recent Activity Stacked */}
        <div className="w-full space-y-6">
          {latestActiveOrder && (
            <ActiveOrderTracker order={latestActiveOrder} />
          )}

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
              <h2 className="font-serif text-[#442D1C]">Recent Activity</h2>
              <Link
                href="/profile/orders"
                className="text-xs text-[#8E5022] font-medium hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-stone-50">
              {allOrders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/profile/orders/${order.id}`}
                  className="block hover:bg-[#FDFBF7] transition-colors"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-[#442D1C] text-sm">
                          {order.OrderItem.length} Items
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#442D1C] text-sm">
                        ₹{order.total}
                      </p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase">
                        {order.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* REMOVED RIGHT COLUMN WITH PROFILE FORM */}
      </div>
    </div>
  );
}
