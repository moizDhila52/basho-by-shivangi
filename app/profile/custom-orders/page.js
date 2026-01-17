import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Calendar, Package } from 'lucide-react';

export default async function MyCustomOrdersPage() {
  // 1. Secure Authentication Check
  const session = await getSession();
  if (!session) redirect('/login');

  // 2. Secure Database Query
  const orders = await prisma.customOrder.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: { createdAt: 'desc' },
  });

  // --- Helper Function for Styles ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'QUOTED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'APPROVED':
      case 'PAID':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  // --- Empty State ---
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#EDD8B4] p-8 md:p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
        <Sparkles className="w-12 h-12 text-[#EDD8B4] mb-4" />
        <h3 className="font-serif text-xl text-[#442D1C] mb-2">
          No Custom Requests
        </h3>
        <p className="text-[#8E5022] mb-6 text-sm md:text-base">
          Have an idea? Commission a unique piece.
        </p>
        <Link
          href="/custom-order"
          className="text-[#C85428] font-bold hover:underline bg-[#FDFBF7] px-6 py-3 rounded-full border border-[#EDD8B4]"
        >
          Start a Request
        </Link>
      </div>
    );
  }

  // --- Main List UI ---
  // Added pb-24 for mobile nav spacing
  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="font-serif text-2xl text-[#442D1C]">Custom Requests</h2>
        <Link
          href="/custom-order"
          className="w-full md:w-auto text-sm font-bold text-[#C85428] hover:underline flex items-center justify-center md:justify-start gap-2 bg-white md:bg-transparent p-3 md:p-0 rounded-xl border md:border-none border-stone-100 shadow-sm md:shadow-none"
        >
          <Sparkles size={14} /> New Request
        </Link>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/profile/custom-orders/${order.id}`}>
            <div className="bg-white p-5 rounded-2xl border border-[#EDD8B4] hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                {/* Left Section: Icon & Title */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FDFBF7] flex items-center justify-center border border-[#EDD8B4] shrink-0">
                    <Package className="w-6 h-6 text-[#8E5022]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#442D1C] text-lg group-hover:text-[#C85428] transition-colors">
                      {order.productType}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      ID: {order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Right Section: Status & Price (Stacked row on mobile with border) */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 border-stone-100 pt-3 md:pt-0 mt-2 md:mt-0">
                  {/* Status Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status.replace('_', ' ')}
                  </div>

                  {/* Logic: Show Price if Quoted, otherwise Show Date */}
                  <div className="text-right min-w-[100px]">
                    {order.status === 'QUOTED' && order.actualPrice ? (
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase font-bold hidden md:block">
                          Quote Price
                        </p>
                        <p className="text-lg md:text-xl font-bold text-[#442D1C]">
                          ₹{order.actualPrice}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-stone-500 text-sm">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
