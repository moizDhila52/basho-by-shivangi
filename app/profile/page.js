"use client";

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

// Simple loading state
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-32 bg-stone-200 rounded-xl w-full"></div>
    <div className="h-64 bg-stone-200 rounded-xl w-full"></div>
  </div>
);

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#EDD8B4]/30 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#8E5022]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm text-stone-400 mb-1">{label}</div>
        <div className="font-medium text-[#442D1C]">{value}</div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!user) return <div className="p-8 text-center text-stone-600">Please log in to view your profile.</div>;

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#EDD8B4]/30 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FDFBF7] shadow-lg">
            {/* Direct Image Rendering for Cloudinary */}
            <img 
              src={user.image || "/images/placeholder-user.jpg"} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
=======
    <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDFBF7] rounded-full -mr-8 -mt-8" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-bold text-[#8E5022] uppercase tracking-wider">
              Active Shipment
            </p>
          </div>
          <h3 className="text-lg font-serif text-[#442D1C]">
            Order #
            {order.orderNumber
              ? order.orderNumber.slice(-8).toUpperCase()
              : order.id.slice(-6).toUpperCase()}
          </h3>
        </div>
        <Link href={`/profile/orders/${order.id}`}>
          <button className="text-xs text-[#8E5022] font-medium hover:underline flex items-center gap-1">
            Track <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      <div className="relative z-10 px-2">
        <div className="absolute top-3 left-2 right-2 h-0.5 bg-stone-100 rounded-full" />
        <div
          className="absolute top-3 left-2 h-0.5 bg-[#8E5022] rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep >= step.id;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#8E5022] border-[#8E5022] text-white'
                      : 'bg-white border-stone-200 text-stone-300'
                  }`}
                >
                  <step.icon className="w-3 h-3" />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isCompleted ? 'text-[#442D1C]' : 'text-stone-300'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      Order: { orderBy: { createdAt: 'desc' }, include: { OrderItem: true } },
    },
  });

  const totalOrders = user.Order.length;
  const activeOrders = user.Order.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status),
  );
  const activeCount = activeOrders.length;
  const latestActiveOrder = activeOrders[0];
  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. Header Section - Full Width */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-[#442D1C] mb-2">
          Welcome back, {user.name?.split(' ')[0] || 'Guest'}
        </h1>
        <p className="text-stone-500">
          Here is what is happening with your collection.
        </p>
      </div>

      {/* 2. Stat Cards Grid - MOVED BELOW HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={ShoppingBag} 
          label="Total Orders" 
          value={totalOrders} 
          subtext="Clay treasures collected"
        />
        <StatCard
          icon={Truck}
          label="Active Shipments"
          value={activeCount}
          subtext={activeCount > 0 ? "On the way" : "No active orders"}
        />
        <StatCard
          icon={Calendar}
          label="Member Since"
          value={memberSince}
          subtext="Part of our journey"
        />
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN (2/3 width) - Tracker & Activity */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tracker */}
          {latestActiveOrder && (
            <ActiveOrderTracker order={latestActiveOrder} />
          )}

          {/* Recent Activity List */}
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

            {user.Order.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                No orders yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-50">
                {user.Order.slice(0, 4).map((order) => (
                  <Link key={order.id} href={`/profile/orders/${order.id}`} className="block">
                  <div
                    key={order.id}
                    className="p-4 flex items-center justify-between hover:bg-[#FDFBF7] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-[#442D1C] text-sm">
                          {order.OrderItem.length} Item
                          {order.OrderItem.length !== 1 && 's'}
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
                      <p
                        className={`text-[10px] font-bold uppercase ${
                          order.status === 'DELIVERED'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            )}
>>>>>>> 61f2a5859023be9d0bb4efdff18c1150232935d5
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-serif text-[#442D1C] mb-1">{user.name || "Pottery Enthusiast"}</h1>
          <p className="text-[#8E5022]">{user.email}</p>
        </div>
        
        <button className="px-6 py-2 border border-[#8E5022] text-[#8E5022] rounded-full hover:bg-[#8E5022] hover:text-white transition-all">
          Edit Profile
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard 
          icon={Mail} 
          label="Email Address" 
          value={user.email} 
        />
        <InfoCard 
          icon={Phone} 
          label="Phone Number" 
          value={user.phone || "Add phone number"} 
        />
        <InfoCard 
          icon={Calendar} 
          label="Member Since" 
          value={user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A'} 
        />
        {/* Address Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#EDD8B4]/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#8E5022]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-stone-400 mb-1">Default Address</div>
            <div className="font-medium text-[#442D1C]">
              Manage your addresses in the Address tab
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}