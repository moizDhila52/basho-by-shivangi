import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import ClientItemsList from '@/components/ClientItemsList'; // Ensure this file exists!
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
    <div className="w-full py-4">
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
                className="flex flex-col items-center gap-2 bg-[#FDFBF7] px-2"
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
                  className={`text-[10px] font-bold uppercase tracking-wider ${
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
  if (!session) redirect('/login');

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: { OrderItem: true },
  });

  if (!order || order.userId !== session.userId) {
    notFound();
  }

  const address =
    typeof order.address === 'string'
      ? JSON.parse(order.address)
      : order.address || {};

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/profile/orders">
              <button className="w-10 h-10 bg-white rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors">
                <ArrowLeft className="w-5 h-5 text-stone-600" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif text-[#442D1C]">
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
              <p className="text-stone-500 text-sm">
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

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
              <HelpCircle className="w-4 h-4" />
              Need Help?
            </button>
            <Link href={`/invoice/${order.id}`} target="_blank">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#442D1C] text-white rounded-xl text-sm font-medium hover:bg-[#2c1d12] transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Invoice
              </button>
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <h3 className="font-bold text-[#442D1C] text-sm mb-6">
                Order Status
              </h3>
              <OrderTracker status={order.status} />
              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-[#FDFBF7] rounded-xl flex justify-between items-center border border-[#EDD8B4]/30">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#8E5022]" />
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Tracking Number
                      </p>
                      <p className="text-sm font-medium text-[#442D1C]">
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

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                <h3 className="font-bold text-[#442D1C] text-sm">
                  Items in this shipment ({order.OrderItem.length})
                </h3>
              </div>
              {/* Pass the items to the Client Component */}
              <ClientItemsList items={order.OrderItem} />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#8E5022]" />
                  <h3 className="font-bold text-[#442D1C] text-sm">
                    Delivery Address
                  </h3>
                </div>
                <div className="text-sm text-stone-600 leading-relaxed pl-6">
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
                    <p className="text-xs text-stone-400">
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
                <InfoRow
                  label="Tax (GST)"
                  value={`₹${order.tax?.toFixed(2)}`}
                />
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
    </div>
  );
}
