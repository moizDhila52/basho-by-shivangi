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
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

// --- Validation Logic ---
const validators = {
  name: (value) => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return 'Name contains invalid characters';
    return '';
  },
  email: (value) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email';
    return '';
  },
  phone: (value) => {
    if (!value) return 'Phone is required';
    if (value.length !== 10) return 'Phone must be exactly 10 digits';
    return '';
  },
};

export default function WorkshopCheckout() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Validation State
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // 1. GATEKEEPER: Check Auth & Existing Booking
  useEffect(() => {
    const checkAuthAndBooking = async () => {
      try {
        // A. Check if user is logged in
        const userRes = await fetch('/api/user/me');

        if (!userRes.ok) {
          // 🛑 Not logged in -> Redirect to login with return URL
          const returnUrl = encodeURIComponent(
            `/workshops/checkout/${sessionId}`,
          );
          router.replace(`/login?redirect=${returnUrl}`);
          return;
        }

        const profile = await userRes.json();

        // Prefill form
        setFormData((prev) => ({
          ...prev,
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
        }));

        // B. Check for existing booking
        const bookingRes = await fetch('/api/user/workshops');
        if (bookingRes.ok) {
          const bookings = await bookingRes.json();
          const alreadyBooked = bookings.some(
            (booking) => booking.sessionId === sessionId,
          );

          if (alreadyBooked) {
            addToast('You are already enrolled in this workshop!', 'success');
            router.replace('/profile/workshops');
            return;
          }
        }

        // If all checks pass, allow rendering
        setCheckingAuth(false);
      } catch (error) {
        console.error('Auth check failed', error);
        // Fallback: Redirect to login on error
        router.replace('/login');
      }
    };

    if (sessionId) checkAuthAndBooking();
  }, [sessionId, router, addToast]);

  // 2. Fetch Session Details
  useEffect(() => {
    if (checkingAuth) return;

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
  }, [sessionId, addToast, checkingAuth]);

  // --- Handlers ---

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validators[field](formData[field]);
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Restrict phone to strictly 10 digits
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData({ ...formData, [name]: processedValue });

    // Real-time validation if already touched
    if (touched[name]) {
      const error = validators[name](processedValue);
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach((field) => {
      const error = validators[field](formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true });
    return isValid;
  };

  const handlePayment = async () => {
    if (!sessionData) return;

    if (!validateForm()) {
      addToast('Please fix the errors before proceeding', 'error');
      return;
    }

    setProcessing(true);

    try {
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

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Bashō Workshops',
        description: sessionData.Workshop.title,
        order_id: data.orderId,
        handler: async function (response) {
          setVerifying(true);
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
              setVerifying(false);
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

  // --- Render States ---

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

  if (loading || checkingAuth) {
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

  const isFormValid =
    !errors.name &&
    !errors.email &&
    !errors.phone &&
    formData.name &&
    formData.email &&
    formData.phone;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center py-20 px-4 pb-24 md:py-12">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Left: Form (Now appears first on Mobile because it is first in source order) */}
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8E5022] mb-6 hover:underline text-sm md:text-base"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-2">
            Secure Your Spot
          </h1>
          <p className="text-[#8E5022] text-sm md:text-base mb-8">
            Enter your details to confirm your booking.
          </p>

          <div className="space-y-5">
            {/* NAME INPUT */}
            <div>
              <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1 ml-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Aditi Sharma"
                  className={`w-full p-4 bg-white border rounded-xl outline-none transition-colors text-sm md:text-base ${
                    touched.name && errors.name
                      ? 'border-red-400 focus:border-red-500'
                      : touched.name && !errors.name
                      ? 'border-green-500 focus:border-green-600'
                      : 'border-[#EDD8B4] focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428]'
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                />
                {touched.name && !errors.name && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {touched.name && errors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <XCircle size={12} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* EMAIL INPUT */}
            <div>
              <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1 ml-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. aditi@example.com"
                  className={`w-full p-4 bg-white border rounded-xl outline-none transition-colors text-sm md:text-base ${
                    touched.email && errors.email
                      ? 'border-red-400 focus:border-red-500'
                      : touched.email && !errors.email
                      ? 'border-green-500 focus:border-green-600'
                      : 'border-[#EDD8B4] focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428]'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                />
                {touched.email && !errors.email && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {touched.email && errors.email && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <XCircle size={12} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* PHONE INPUT */}
            <div>
              <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={`w-full p-4 bg-white border rounded-xl outline-none transition-colors text-sm md:text-base ${
                    touched.phone && errors.phone
                      ? 'border-red-400 focus:border-red-500'
                      : touched.phone &&
                        !errors.phone &&
                        formData.phone.length === 10
                      ? 'border-green-500 focus:border-green-600'
                      : 'border-[#EDD8B4] focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428]'
                  }`}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                />
                {touched.phone &&
                  !errors.phone &&
                  formData.phone.length === 10 && (
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
              </div>
              {touched.phone && errors.phone && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <XCircle size={12} />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary Card (Now appears second on Mobile) */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EDD8B4] shadow-xl relative">
          <h3 className="font-serif text-xl text-[#442D1C] mb-6 border-b border-[#EDD8B4] pb-4">
            Workshop Summary
          </h3>

          <div className="space-y-6 mb-8">
            <div>
              <p className="font-medium text-[#442D1C] text-lg md:text-xl leading-tight mb-2">
                {sessionData.Workshop.title}
              </p>
              <p className="text-sm text-[#8E5022] flex items-center gap-2">
                <MapPin size={16} /> {sessionData.Workshop.location}
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EDD8B4]/50 flex gap-4 items-center">
              <div className="text-center px-4 border-r border-[#EDD8B4] min-w-[80px]">
                <p className="text-[10px] md:text-xs font-bold text-[#8E5022] uppercase">
                  Date
                </p>
                <p className="font-serif text-xl md:text-2xl text-[#442D1C]">
                  {new Date(sessionData.date).getDate()}
                </p>
                <p className="text-[10px] md:text-xs text-[#8E5022] font-bold uppercase">
                  {new Date(sessionData.date).toLocaleString('default', {
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Time
                </p>
                <p className="text-[#442D1C] flex items-center gap-2 font-medium text-sm md:text-base">
                  <Clock size={16} className="text-[#C85428]" />{' '}
                  {sessionData.time}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 pt-4 border-t border-dashed border-[#EDD8B4]">
            <span className="text-[#8E5022] font-medium text-sm md:text-base">
              Total Amount
            </span>
            <span className="text-2xl font-serif text-[#442D1C]">
              ₹{sessionData.Workshop.price}
            </span>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg text-sm md:text-base ${
              processing
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : isFormValid
                ? 'bg-[#442D1C] text-[#EDD8B4] hover:bg-[#2c1d12]'
                : 'bg-[#442D1C]/50 text-[#EDD8B4] cursor-pointer'
            }`}
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
