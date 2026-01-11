'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Package,
  DollarSign,
  Download,
  CheckCircle,
  Loader2,
  Lock,
  CreditCard,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

// Helper to show status progress
function StatusTracker({ status }) {
  const steps = [
    { id: 1, label: 'Pending', icon: Clock },
    { id: 2, label: 'Quoted', icon: DollarSign },
    { id: 3, label: 'Approved', icon: CheckCircle }, // Paid
    { id: 4, label: 'In Progress', icon: Package },
    { id: 5, label: 'Completed', icon: MapPin },
  ];

  let currentStep = 1;
  if (['QUOTED'].includes(status)) currentStep = 2;
  if (['APPROVED', 'PAID'].includes(status)) currentStep = 3;
  if (['IN_PROGRESS'].includes(status)) currentStep = 4;
  if (['COMPLETED', 'SHIPPED', 'DELIVERED'].includes(status)) currentStep = 5;

  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full" />
        {/* Active Progress */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#8E5022] -translate-y-1/2 rounded-full transition-all duration-1000"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between w-full">
          {steps.map((step) => {
            const isCompleted = currentStep >= step.id;
            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 bg-[#FDFBF7] px-2 z-10"
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

export default function CustomOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/custom-orders/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        // Keep order null to trigger specific error UI
      });
  }, [id]);

  const handlePayment = async () => {
    if (!order?.actualPrice) return;
    setPaying(true);
    try {
      const res = await fetch('/api/custom-orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Bashō Custom',
        description: `Order #${order.id.slice(0, 8)}`,
        order_id: data.orderId,
        handler: async function (response) {
          const verifyRes = await fetch('/api/custom-orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              customOrderId: order.id,
            }),
          });

          if (verifyRes.ok) {
            addToast('Payment successful! Order approved.', 'success');
            window.location.reload();
          } else {
            addToast('Payment verification failed', 'error');
          }
        },
        theme: { color: '#442D1C' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      addToast(error.message || 'Payment failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-[#8E5022]" />
      </div>
    );

  // FIX: Check for order.id to prevent "slice of undefined" error
  if (!order || !order.id) {
    return (
      <div className="p-20 text-center border-2 border-dashed border-[#EDD8B4] rounded-2xl">
        <AlertCircle className="w-12 h-12 text-[#EDD8B4] mx-auto mb-4" />
        <h3 className="text-xl font-serif text-[#442D1C]">Order Not Found</h3>
        <Link
          href="/profile/custom-orders"
          className="text-[#C85428] underline mt-4 inline-block"
        >
          Back to Requests
        </Link>
      </div>
    );
  }

  // Determine if payment is completed
  const isPaid = [
    'APPROVED',
    'PAID',
    'IN_PROGRESS',
    'COMPLETED',
    'SHIPPED',
  ].includes(order.status);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/profile/custom-orders">
            <button className="w-10 h-10 bg-white rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif text-[#442D1C]">
                Request #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDD8B4] text-[#442D1C]">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-stone-500 text-sm">
              Submitted on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            <HelpCircle className="w-4 h-4" /> Need Help?
          </button>
          {/* INVOICE BUTTON (Shows when paid) */}
          {isPaid && (
            <Link href={`/invoice/custom/${order.id}`} target="_blank">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#442D1C] text-white rounded-xl text-sm font-medium hover:bg-[#2c1d12] transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Invoice
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Pay Now Section (Only if Quoted) */}
      {order.status === 'QUOTED' && order.actualPrice && (
        <div className="bg-[#442D1C] rounded-2xl p-8 text-[#EDD8B4] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-serif text-2xl mb-2 flex items-center gap-2">
              <DollarSign className="w-6 h-6" /> Quote Ready
            </h3>
            <p className="opacity-90 max-w-md text-sm leading-relaxed">
              Our team has reviewed your request. This price includes materials,
              craftsmanship, and kiln firing. Secure your order to begin
              production.
            </p>
          </div>
          <div className="text-center md:text-right relative z-10">
            <p className="text-xs uppercase tracking-widest opacity-70 mb-1">
              Total Amount
            </p>
            <p className="text-4xl font-serif mb-4">₹{order.actualPrice}</p>
            <button
              onClick={handlePayment}
              disabled={paying}
              className="bg-[#EDD8B4] text-[#442D1C] px-8 py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg"
            >
              {paying ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              Accept & Pay
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="font-bold text-[#442D1C] text-sm mb-2">
              Request Status
            </h3>
            <StatusTracker status={order.status} />
          </div>

          {/* Item Details */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <h3 className="font-bold text-[#442D1C] text-sm">
                Request Specifications
              </h3>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Product Type
                </p>
                <p className="text-[#442D1C] font-medium text-lg">
                  {order.productType}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Quantity
                </p>
                <p className="text-[#442D1C]">{order.quantity} Units</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Material
                </p>
                <p className="text-[#442D1C] capitalize">{order.material}</p>
              </div>
              {order.glaze && (
                <div>
                  <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                    Glaze / Finish
                  </p>
                  <p className="text-[#442D1C] capitalize">{order.glaze}</p>
                </div>
              )}
              {order.dimensions && (
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-[#8E5022] uppercase mb-2">
                    Dimensions (cm)
                  </p>
                  <div className="flex gap-4 bg-[#FDFBF7] p-3 rounded-lg border border-[#EDD8B4]/30 w-fit">
                    <span>
                      <strong>H:</strong> {order.dimensions.height || '-'}
                    </span>
                    <span>
                      <strong>W:</strong> {order.dimensions.width || '-'}
                    </span>
                    <span>
                      <strong>D:</strong> {order.dimensions.depth || '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          {order.adminNotes && (
            <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#EDD8B4] border-dashed">
              <h3 className="font-bold text-[#442D1C] text-sm mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C85428]" /> Notes from
                Artisan
              </h3>
              <p className="text-stone-600 text-sm italic">
                "{order.adminNotes}"
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timeline Info */}
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#8E5022]" />
                <h3 className="font-bold text-[#442D1C] text-sm">
                  Estimated Timeline
                </h3>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-sm text-stone-500">Completion Estimate</p>
                <p className="text-base font-medium text-[#442D1C]">
                  {order.estimatedCompletion || 'To Be Decided'}
                </p>
              </div>
            </div>

            {/* PAYMENT DETAILS (MATCHING REFERENCE) */}
            {isPaid && (
              <>
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
                        Transaction ID:{' '}
                        <span className="font-mono">
                          {order.paymentId.slice(0, 12)}...
                        </span>
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-green-50 text-green-700">
                      PAID
                    </span>

                    <div className="pt-3 border-t border-stone-200 mt-2 flex justify-between items-center">
                      <span className="text-sm text-stone-600">Total</span>
                      <span className="text-lg font-serif font-bold text-[#442D1C]">
                        ₹{order.actualPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Icon
function MessageSquare({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
