'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import {
  Loader2,
  Clock,
  MapPin,
  Lock,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function WorkshopCheckout() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false); // <--- NEW STATE
  const [sessionData, setSessionData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Fetch Session Details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/workshops/session/${sessionId}`);
        if (!res.ok) throw new Error('Failed to load session details');
        const data = await res.json();
        setSessionData(data);
      } catch (error) {
        console.error(error);
        addToast('Could not load workshop details', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchSession();
  }, [sessionId, addToast]);

  const handlePayment = async () => {
    if (!sessionData) return;
    setProcessing(true);

    try {
      // 1. Initialize Order
      const res = await fetch('/api/workshops/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Open Razorpay
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Bashō Workshops',
        description: sessionData.Workshop.title,
        order_id: data.orderId,
        handler: async function (response) {
          // --- NEW: Trigger Verification Overlay ---
          setVerifying(true);
          // ----------------------------------------

          // Verify Payment
          try {
            const verifyRes = await fetch('/api/workshops/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                registrationId: data.registrationId,
              }),
            });

            if (verifyRes.ok) {
              router.push('/workshops/success');
            } else {
              setVerifying(false); // Hide overlay if failed
              addToast('Payment verification failed', 'error');
            }
          } catch (err) {
            setVerifying(false);
            addToast('Verification network error', 'error');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#442D1C' },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setProcessing(false);
      addToast(error.message || 'Something went wrong', 'error');
    }
  };

  // --- NEW: Verification Overlay Component ---
  if (verifying) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-[#EDD8B4] text-center max-w-sm w-full">
          <Loader2 className="w-12 h-12 text-[#C85428] animate-spin mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-[#442D1C] mb-2">
            Verifying Payment
          </h3>
          <p className="text-[#8E5022]">
            Please wait while we secure your spot...
          </p>
          <div className="mt-6 flex justify-center gap-2 text-xs text-stone-400 font-medium">
            <ShieldCheck size={14} /> Bank Grade Security
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin text-[#C85428] w-10 h-10" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-serif text-[#442D1C]">
          Session Not Found
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#C85428] underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center py-12 px-4">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left: Form */}
        <div className="order-2 md:order-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8E5022] mb-6 hover:underline"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-2">
            Secure Your Spot
          </h1>
          <p className="text-[#8E5022] mb-8">
            Enter your details to confirm your booking.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1 ml-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aditi Sharma"
                className="w-full p-4 bg-white border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428]"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. aditi@example.com"
                className="w-full p-4 bg-white border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428]"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1 ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                className="w-full p-4 bg-white border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428]"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="order-1 md:order-2 bg-white p-8 rounded-3xl border border-[#EDD8B4] shadow-xl relative">
          <h3 className="font-serif text-xl text-[#442D1C] mb-6 border-b border-[#EDD8B4] pb-4">
            Workshop Summary
          </h3>

          <div className="space-y-6 mb-8">
            <div>
              <p className="font-medium text-[#442D1C] text-xl leading-tight mb-2">
                {sessionData.Workshop.title}
              </p>
              <p className="text-sm text-[#8E5022] flex items-center gap-2">
                <MapPin size={16} /> {sessionData.Workshop.location}
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EDD8B4]/50 flex gap-4 items-center">
              <div className="text-center px-4 border-r border-[#EDD8B4] min-w-[80px]">
                <p className="text-xs font-bold text-[#8E5022] uppercase">
                  Date
                </p>
                <p className="font-serif text-2xl text-[#442D1C]">
                  {new Date(sessionData.date).getDate()}
                </p>
                <p className="text-xs text-[#8E5022] font-bold uppercase">
                  {new Date(sessionData.date).toLocaleString('default', {
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Time
                </p>
                <p className="text-[#442D1C] flex items-center gap-2 font-medium">
                  <Clock size={16} className="text-[#C85428]" />{' '}
                  {sessionData.time}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 pt-4 border-t border-dashed border-[#EDD8B4]">
            <span className="text-[#8E5022] font-medium">Total Amount</span>
            <span className="text-2xl font-serif text-[#442D1C]">
              ₹{sessionData.Workshop.price}
            </span>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing || !formData.name || !formData.email}
            className="w-full bg-[#442D1C] text-[#EDD8B4] py-4 rounded-xl font-bold hover:bg-[#2c1d12] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg"
          >
            {processing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Lock size={18} />
            )}
            Pay ₹{sessionData.Workshop.price}
          </button>

          <p className="text-center text-[10px] text-[#8E5022]/60 mt-4 flex items-center justify-center gap-1">
            <Lock size={10} /> Secure payment via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
