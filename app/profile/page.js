// app/profile/page.js
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  Calendar,
  CheckCircle,
  Package as PackageIcon,
  MapPin,
  ChevronRight,
} from 'lucide-react';

// 👇 NUCLEAR CACHE BUSTING
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Smaller Components ---
// (Keep StatCard and ActiveOrderTracker exactly as they were in your original code)
function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
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
    if (['PENDING', 'CONFIRMED'].includes(status)) return 1;
    if (['PROCESSING'].includes(status)) return 2;
    if (['SHIPPED'].includes(status)) return 3;
    if (['DELIVERED'].includes(status)) return 4;
    return 0;
  };

  const currentStep = getProgressStep(order.status);
  const steps = [
    { id: 1, label: 'Confirmed', icon: CheckCircle },
    { id: 2, label: 'Preparing', icon: PackageIcon },
    { id: 3, label: 'Shipped', icon: Truck },
    { id: 4, label: 'Delivered', icon: MapPin },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm mb-8 relative overflow-hidden">
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
  });

  if (!user) redirect('/login');

  // Fetch orders
  const allOrders = await prisma.order.findMany({
    where: {
      OR: [{ userId: session.userId }, { customerEmail: user.email }],
    },
    include: { OrderItem: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalOrders = allOrders.length;
  const activeOrders = allOrders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status),
  );
  const activeCount = activeOrders.length;
  const latestActiveOrder = activeOrders[0];
  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-[#442D1C] mb-3">
          Welcome back, {user.name?.split(' ')[0] || 'Guest'}
        </h1>
        <p className="text-stone-500 text-lg">
          Here is an overview of your collection and activity.
        </p>
      </div>

      {/* 2. Stat Cards Grid - Expanded to 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          subtext={activeCount > 0 ? 'On the way' : 'No active orders'}
        />
        <StatCard
          icon={Calendar}
          label="Member Since"
          value={memberSince}
          subtext="Part of our journey"
        />
      </div>

      {/* 3. Main Content - Removed grid-cols-3, now just a stack */}
      <div className="space-y-8">
        {/* Tracker */}
        {latestActiveOrder && <ActiveOrderTracker order={latestActiveOrder} />}

        {/* Recent Activity List - Expanded width */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="font-serif text-xl text-[#442D1C]">
              Recent Activity
            </h2>
            <Link
              href="/profile/orders"
              className="text-sm text-[#C85428] font-bold hover:underline"
            >
              View All History
            </Link>
          </div>

          {allOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-4" />
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {allOrders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/profile/orders/${order.id}`}
                  className="block group"
                >
                  <div className="p-5 flex items-center justify-between hover:bg-[#FDFBF7] transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-stone-200">
                        <PackageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-[#442D1C] text-base mb-1">
                          Order #
                          {order.orderNumber
                            ? order.orderNumber.slice(-8).toUpperCase()
                            : order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-stone-500 flex gap-3">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{order.OrderItem.length} Items</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-bold text-[#442D1C] text-lg mb-1">
                        ₹{order.total}
                      </p>
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full inline-block ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-50 text-blue-700'
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
    </div>
  );
}
