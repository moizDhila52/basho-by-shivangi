import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProfileForm from './ProfileForm';
import {
  Package,
  Truck,
  CheckCircle,
  ShoppingBag,
  Calendar,
  ChevronRight,
  MapPin,
} from 'lucide-react';

// --- Smaller Components ---

// Updated StatCard Component with better visibility and earthy colors
function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
      {/* Light background with Basho brand color icon */}
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

function ActiveOrderTracker({ order }) {
  if (!order) return null;
  const getProgressStep = (status) => {
    if (['PENDING'].includes(status)) return 1;
    if (['PROCESSING'].includes(status)) return 2;
    if (['SHIPPED'].includes(status)) return 3;
    if (['DELIVERED'].includes(status)) return 4;
    return 0;
  };
  const currentStep = getProgressStep(order.status);
  const steps = [
    { id: 1, label: 'Confirmed', icon: CheckCircle },
    { id: 2, label: 'Preparing', icon: Package },
    { id: 3, label: 'Shipped', icon: Truck },
    { id: 4, label: 'Delivered', icon: MapPin },
  ];

  return (
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
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 width) - Account Details */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm sticky top-28">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 bg-[#EDD8B4] rounded-full flex items-center justify-center text-[#442D1C] font-serif font-bold">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-[#442D1C] text-sm">
                  Account Details
                </h3>
                <p className="text-xs text-stone-500">Update your profile</p>
              </div>
            </div>
            {/* Reusing your ProfileForm component */}
            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}