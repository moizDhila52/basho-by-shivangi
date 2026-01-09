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
} from 'lucide-react';

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
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-3 h-3" />,
        label: 'Payment Pending',
      };
    case 'PROCESSING':
      return {
        color: 'bg-blue-50 text-blue-700',
        icon: <Package className="w-3 h-3" />,
        label: 'Being Prepared',
      };
    case 'SHIPPED':
      return {
        color: 'bg-purple-50 text-purple-700',
        icon: <Truck className="w-3 h-3" />,
        label: 'On the Way',
      };
    case 'DELIVERED':
      return {
        color: 'bg-green-50 text-green-700',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Delivered',
      };
    case 'CANCELLED':
      return {
        color: 'bg-red-50 text-red-700',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Cancelled',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-700',
        icon: <Clock className="w-3 h-3" />,
        label: status,
      };
  }
};

export default async function MyOrdersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch all orders with items
  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      OrderItem: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const activeOrders = orders.filter((o) =>
    ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status),
  );
  const pastOrders = orders.filter((o) =>
    ['DELIVERED', 'CANCELLED'].includes(o.status),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-[#442D1C]">My Collection</h1>
        <Link href="/products">
          <button className="text-sm font-medium text-[#8E5022] hover:underline flex items-center gap-1">
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
              <h2 className="text-xl font-serif text-[#442D1C] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
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
              <h2 className="text-xl font-serif text-[#442D1C] mb-4 text-stone-500">
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
      } overflow-hidden transition-all hover:shadow-lg`}
    >
      {/* Header */}
      <div className="bg-[#FDFBF7] px-6 py-4 border-b border-stone-100 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wider">
              Order Placed
            </p>
            <p className="font-medium text-[#442D1C]">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wider">
              Total
            </p>
            <p className="font-medium text-[#442D1C]">
              {formatPrice(order.total)}
            </p>
          </div>
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wider">
              Order #
            </p>
            <Link href={`/profile/orders/${order.id}`}>
              <p className="font-mono text-stone-600 hover:text-[#8E5022] hover:underline cursor-pointer">
                {(order.orderNumber || order.id).slice(-8).toUpperCase()}
              </p>
            </Link>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${status.color
            .replace('bg-', 'border-')
            .replace('text-', 'bg-opacity-10 ')}`}
        >
          {status.icon}
          <span>{status.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Product Images (Gallery style) */}
          <Link href={`/profile/orders/${order.id}`} className="flex-1">
            <div className="flex-1 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {order.OrderItem.map((item) => (
                <div key={item.id} className="flex-shrink-0 group relative">
                  <div className="w-20 h-20 rounded-lg bg-stone-100 overflow-hidden border border-stone-200">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-[#442D1C] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 min-w-[140px]">
            {isActive ? (
              <Link href={`/profile/orders/${order.id}`}>
                <button className="w-full bg-[#8E5022] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#652810] transition-colors">
                  Track Package
                </button>
              </Link>
            ) : (
              <Link href={`/profile/orders/${order.id}`}>
                <button className="w-full bg-[#8E5022] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#652810] transition-colors">
                  Track Package
                </button>
              </Link>
            )}
            <button className="text-stone-500 text-sm hover:text-[#8E5022] hover:underline">
              View Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-[#EDD8B4]">
      <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-8 h-8 text-[#EDD8B4]" />
      </div>
      <h2 className="text-2xl font-serif text-[#442D1C] mb-2">
        Your collection is empty
      </h2>
      <p className="text-stone-500 mb-8 max-w-sm mx-auto">
        Looks like you haven't discovered your first clay treasure yet. Our
        artisans are crafting something special just for you.
      </p>
      <Link href="/products">
        <button className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-all shadow-lg hover:shadow-xl">
          Start Collecting
        </button>
      </Link>
    </div>
  );
}
