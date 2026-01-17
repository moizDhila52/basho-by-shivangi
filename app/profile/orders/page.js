import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

// 👇 NUCLEAR CACHE BUSTING
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to format currency
const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Helper to get status color and icon
const getStatusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <Clock className="w-3 h-3" />,
        label: 'Payment Pending',
      };
    case 'CONFIRMED':
      return {
        color: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Confirmed',
      };
    case 'PROCESSING':
      return {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Package className="w-3 h-3" />,
        label: 'Processing',
      };
    case 'SHIPPED':
      return {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <Truck className="w-3 h-3" />,
        label: 'Shipped',
      };
    case 'DELIVERED':
      return {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Delivered',
      };
    case 'CANCELLED':
      return {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Cancelled',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <Clock className="w-3 h-3" />,
        label: status,
      };
  }
};

export default async function MyOrdersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  if (!user) redirect('/login');

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: session.userId }, { customerEmail: user.email }],
    },
    include: {
      OrderItem: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const activeOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status),
  );
  const pastOrders = orders.filter((o) =>
    ['DELIVERED', 'CANCELLED'].includes(o.status),
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-0">
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#442D1C]">My Collection</h1>
            <p className="text-sm text-stone-500 mt-1">Track your past and active orders</p>
        </div>
        <Link href="/products">
          <button className="text-sm font-bold text-[#8E5022] hover:bg-[#8E5022]/10 px-4 py-2 rounded-full transition-colors flex items-center gap-2 border border-[#EDD8B4]">
            Browse Shop <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-12">
          {/* Section: Active Orders */}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[#442D1C] mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                In Progress
              </h2>
              <div className="grid gap-6">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} isActive={true} />
                ))}
              </div>
            </section>
          )}

          {/* Section: Past Orders */}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-stone-400 mb-4 uppercase tracking-wide">
                Past Treasures
              </h2>
              <div className="grid gap-6">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} isActive={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// --- Components ---

function OrderCard({ order, isActive }) {
  const status = getStatusBadge(order.status);

  return (
    <div
      className={`bg-white rounded-2xl border ${
        isActive ? 'border-[#EDD8B4] shadow-md' : 'border-stone-100'
      } overflow-hidden transition-all hover:shadow-lg group`}
    >
      {/* Mobile-Friendly Header */}
      <div className="bg-[#FDFBF7] p-4 md:px-6 md:py-4 border-b border-stone-100">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            
            {/* Top Row on Mobile: ID & Status */}
            <div className="flex justify-between items-center md:hidden mb-2 border-b border-stone-200 pb-2">
                <span className="font-mono text-xs text-stone-500">
                    #{order.orderNumber ? order.orderNumber : order.id.slice(-8).toUpperCase()}
                </span>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                    {status.icon}
                    <span>{status.label}</span>
                </div>
            </div>

            {/* Info Grid (Date, Total, ID-Desktop) */}
            <div className="grid grid-cols-2 md:flex md:gap-8 gap-y-1 w-full md:w-auto">
                <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Order Placed</p>
                    <p className="text-sm font-medium text-[#442D1C]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Total Amount</p>
                    <p className="text-sm font-medium text-[#442D1C]">
                        {formatPrice(order.total)}
                    </p>
                </div>
                {/* Desktop Only ID */}
                <div className="hidden md:block">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Order ID</p>
                    <p className="text-sm font-mono text-stone-600">
                        #{order.orderNumber ? order.orderNumber : order.id.slice(-8).toUpperCase()}
                    </p>
                </div>
            </div>

            {/* Desktop Only Status */}
            <div className="hidden md:flex">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                    {status.icon}
                    <span>{status.label}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Scrollable Product Images */}
          <Link href={`/profile/orders/${order.id}`} className="w-full md:flex-1 block">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {order.OrderItem.map((item) => (
                <div key={item.id} className="flex-shrink-0 relative w-20 h-20 md:w-24 md:h-24">
                  <div className="w-full h-full rounded-xl bg-stone-50 overflow-hidden border border-stone-200">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-[#442D1C] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border border-white">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex md:flex-col gap-3 w-full md:w-auto md:min-w-[160px] border-t md:border-t-0 border-stone-100 pt-4 md:pt-0 mt-2 md:mt-0">
            <Link href={`/profile/orders/${order.id}`} className="flex-1">
              <button className="w-full bg-[#442D1C] text-[#EDD8B4] px-4 py-3 md:py-2.5 rounded-xl text-sm font-bold hover:bg-[#2c1d12] transition-colors flex items-center justify-center gap-2">
                Track Order <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            
            <Link href={`/invoice/${order.id}`} target="_blank" className="flex-1">
              <button className="w-full bg-white border border-stone-200 text-stone-600 px-4 py-3 md:py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors">
                View Invoice
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-[#EDD8B4]">
      <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-8 h-8 text-[#EDD8B4]" />
      </div>
      <h2 className="text-2xl font-serif text-[#442D1C] mb-3">
        Your collection is empty
      </h2>
      <p className="text-stone-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        Looks like you haven't discovered your first clay treasure yet. Our
        artisans are crafting something special just for you.
      </p>
      <Link href="/products">
        <button className="bg-[#8E5022] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#652810] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          Start Collecting
        </button>
      </Link>
    </div>
  );
}