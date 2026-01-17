import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import ClientItemsList from '@/components/ClientItemsList';
import OrderPaymentStatus from '@/components/OrderPaymentStatus';
import InvoiceActions from '@/components/InvoiceActions';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  CreditCard,
  Download,
  HelpCircle,
} from 'lucide-react';

// 👇 NUCLEAR CACHE BUSTING
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// --- Helper Components ---
function OrderTracker({ status }) {
  const steps = [
    { id: 1, label: 'Confirmed', icon: CheckCircle },
    { id: 2, label: 'Processing', icon: Package },
    { id: 3, label: 'Shipped', icon: Truck },
    { id: 4, label: 'Delivered', icon: MapPin },
  ];

  const getStepStatus = (currentStatus) => {
    if (['PENDING'].includes(currentStatus)) return 0;
    if (['CONFIRMED'].includes(currentStatus)) return 1;
    if (['PROCESSING'].includes(currentStatus)) return 2;
    if (['SHIPPED'].includes(currentStatus)) return 3;
    if (['DELIVERED'].includes(currentStatus)) return 4;
    return 0;
  };

  const currentStep = getStepStatus(status);

  return (
    <div className="w-full py-4 px-1">
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#8E5022] -translate-y-1/2 rounded-full transition-all duration-1000"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
        <div className="relative flex justify-between w-full">
          {steps.map((step) => {
            const isCompleted = currentStep >= step.id;
            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 bg-[#FDFBF7] px-1 z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#8E5022] border-[#8E5022] text-white'
                      : 'bg-white border-stone-200 text-stone-300'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-center ${
                    isCompleted ? 'text-[#8E5022]' : 'text-stone-400'
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

function InfoRow({ label, value, isTotal = false }) {
  return (
    <div
      className={`flex justify-between items-center ${
        isTotal ? 'pt-3 border-t border-stone-200 mt-2' : 'py-1'
      }`}
    >
      <span
        className={`text-sm ${
          isTotal
            ? 'font-serif text-[#442D1C] font-bold text-lg'
            : 'text-stone-500'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          isTotal
            ? 'font-serif text-[#442D1C] font-bold text-lg'
            : 'text-[#442D1C] font-medium'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// --- Main Page (Server Component) ---

export default async function OrderDetailPage({ params }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  // 1. Fetch Current User
  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: { OrderItem: true },
  });

  if (!order) {
    notFound();
  }

  // 2. Security Logic
  const isOwner = order.userId === session.userId;
  const isGuestOwner =
    order.userId === null && order.customerEmail === currentUser?.email;

  if (!isOwner && !isGuestOwner) {
    notFound();
  }

  const address =
    typeof order.address === 'string'
      ? JSON.parse(order.address)
      : order.address || {};

  // 👇 FIXED: Removed 'min-h-screen', 'bg-[#FDFBF7]', 'pb-24' and 'p-4' to fix whitespace
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
      {/* --- Header Section --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/profile/orders">
            <button className="w-10 h-10 bg-white rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </button>
          </Link>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-serif text-[#442D1C]">
                Order #
                {order.orderNumber
                  ? order.orderNumber
                  : order.id.slice(-8).toUpperCase()}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'DELIVERED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-stone-500 text-xs md:text-sm mt-1">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-3 w-full lg:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="whitespace-nowrap">Need Help?</span>
          </button>
          <div className="flex-1 sm:flex-none">
            <InvoiceActions orderId={order.id} hasGst={!!order.customerGst} />
          </div>
        </div>
      </div>

      {/* --- Main Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <OrderPaymentStatus order={order} />

          {/* Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="font-bold text-[#442D1C] text-sm mb-6">
              Order Status
            </h3>
            <OrderTracker status={order.status} />

            {order.trackingNumber && (
              <div className="mt-6 p-4 bg-[#FDFBF7] rounded-xl flex flex-wrap gap-4 justify-between items-center border border-[#EDD8B4]/30">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#8E5022]" />
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Tracking Number
                    </p>
                    <p className="text-sm font-medium text-[#442D1C] break-all">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>
                <button className="text-xs text-[#8E5022] underline hover:text-[#652810]">
                  Track on Courier
                </button>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <h3 className="font-bold text-[#442D1C] text-sm">
                Items in this shipment ({order.OrderItem.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <ClientItemsList items={order.OrderItem} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-6">
            {/* Address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#8E5022]" />
                <h3 className="font-bold text-[#442D1C] text-sm">
                  Delivery Address
                </h3>
              </div>
              <div className="text-sm text-stone-600 leading-relaxed pl-6 break-words">
                {address.street ? (
                  <>
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state}
                    </p>
                    <p>{address.pincode}</p>
                    <p>India</p>
                  </>
                ) : (
                  <p className="text-stone-400 italic">
                    Address data unavailable
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-stone-100" />

            {/* Payment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-[#8E5022]" />
                <h3 className="font-bold text-[#442D1C] text-sm">
                  Payment Details
                </h3>
              </div>
              <div className="pl-6 space-y-2">
                <p className="text-sm text-stone-600">
                  Method:{' '}
                  <span className="font-medium text-[#442D1C]">
                    Online (Razorpay)
                  </span>
                </p>
                {order.paymentId && (
                  <p className="text-xs text-stone-400 break-all">
                    Transaction ID: {order.paymentId}
                  </p>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm bg-[#FDFBF7]">
            <h3 className="font-bold text-[#442D1C] text-sm mb-4">
              Order Summary
            </h3>
            <div className="space-y-2">
              <InfoRow
                label="Subtotal"
                value={`₹${order.subtotal?.toFixed(2)}`}
              />
              <InfoRow
                label="Shipping"
                value={
                  order.shippingCost === 0
                    ? 'Free'
                    : `₹${order.shippingCost?.toFixed(2)}`
                }
              />
              <InfoRow label="Tax (GST)" value={`₹${order.tax?.toFixed(2)}`} />
              {order.discount > 0 && (
                <InfoRow
                  label="Discount"
                  value={`-₹${order.discount.toFixed(2)}`}
                />
              )}
              <InfoRow
                label="Total"
                value={`₹${order.total.toFixed(2)}`}
                isTotal
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
