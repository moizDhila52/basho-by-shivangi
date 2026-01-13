'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { loadRazorpayScript } from '@/lib/razorpay';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  ShieldCheck,
  MapPin,
  Package,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle,
  Loader2,
  X,
  Edit2,
  Plus,
  LogOut,
  Info,
  Trash2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PaymentOverlay = ({ status }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md"
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-stone-100 max-w-sm w-full text-center relative overflow-hidden">
        <div className="flex flex-col items-center gap-6 py-4">
          {status === 'processing' && (
            <>
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-[#EDD8B4] rounded-full"
                />
                <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-stone-100">
                  <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#442D1C]">
                  Verifying Payment
                </h3>
                <p className="text-stone-500 text-sm">
                  Please wait while we secure your order...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="spring"
                stiffness={200}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#442D1C]">
                  Payment Successful!
                </h3>
                <p className="text-stone-500 text-sm">
                  Redirecting to your order details...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { user, logout } = useAuth();
  const router = useRouter();
  const {
    cartItems,
    getTotalPrice,
    getTotalItems,
    clearCart,
    loading: cartLoading,
  } = useCart();

  const [formData, setFormData] = useState({
    name: '', // Will be filled from DB
    email: '', // Will be filled from DB
    phone: '', // Will be filled from DB
    gst: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [settings, setSettings] = useState({
    shippingBaseRate: 50, // Default fallback
    shippingPerKgRate: 40,
    freeShippingThreshold: 5000,
    gstPercent: 12,
  });

  // --- Address Management States ---
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');

  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  // --- 2. Dynamic Cost Calculation ---
  const subtotal = getTotalPrice();

  // Calculate Total Weight of Cart
  const totalWeight = cartItems.reduce((acc, item) => {
    // Default to 0.5kg if weight is missing
    return acc + (item.weight || 0.5) * item.quantity;
  }, 0);

  // Calculate Shipping (Matches Backend Logic)
  let shippingCost = 0;
  if (subtotal >= settings.freeShippingThreshold) {
    shippingCost = 0;
  } else {
    if (totalWeight <= 1) {
      shippingCost = settings.shippingBaseRate;
    } else {
      const extraWeight = Math.ceil(totalWeight - 1);
      shippingCost =
        settings.shippingBaseRate + extraWeight * settings.shippingPerKgRate;
    }
  }

  const gstAmount = subtotal * (settings.gstPercent / 100);
  const totalAmount = subtotal + gstAmount + shippingCost;

  // --- 1. Basic Checks & Auth Redirect ---
 useEffect(() => {
    if (!user) return;

    // FIX: If cart is empty and we aren't currently paying, kick them out
    if (cartItems.length === 0 && !cartLoading && !isPaymentSuccess) {
      // Use replace so this page doesn't stay in browser history
      router.replace('/cart'); 
    }
  }, [user, cartItems.length, router, cartLoading, isPaymentSuccess]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  // --- 2. NEW FEATURE: Fetch User Profile (Pre-fill Contact Info) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        // Fetch from our new API to get the Phone Number stored in DB
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const profile = await res.json();
          setFormData((prev) => ({
            ...prev,
            name: profile.name || user.displayName || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '', // <--- This pre-fills the phone!
          }));
        } else {
          // Fallback to Auth Provider data if API fails
          setFormData((prev) => ({
            ...prev,
            name: user.displayName || '',
            email: user.email || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // --- 3. Fetch Saved Addresses ---
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/address');
        if (res.ok) {
          const data = await res.json();
          setSavedAddresses(data);

          if (data.length > 0) {
            const defaultAddr = data.find((a) => a.isDefault) || data[0];
            setSelectedAddressId(defaultAddr.id);
            setFormData((prev) => ({
              ...prev,
              street: defaultAddr.street,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            }));
          } else {
            setShowAddressForm(true);
          }
        }
      } catch (error) {
        console.error('Failed to load addresses');
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [user]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    // 👇 FIX 1: Find the parent form element (e.target is just the button)
    const formEl = e.target.closest('form');
    const formDataObj = new FormData(formEl);

    // 👇 FIX 2: Manually pick only address fields
    // (We do this so we don't accidentally send 'name' or 'email' to the Address API)
    const payload = {
      street: formDataObj.get('street'),
      city: formDataObj.get('city'),
      state: formDataObj.get('state'),
      pincode: formDataObj.get('pincode'),
      isDefault: formDataObj.get('isDefault') === 'on',
    };

    const method = editingAddress ? 'PUT' : 'POST';
    if (editingAddress) payload.id = editingAddress.id;

    try {
      const res = await fetch('/api/address', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      toast.success(editingAddress ? 'Address updated' : 'Address saved');

      let updatedList;
      if (editingAddress) {
        updatedList = savedAddresses.map((addr) =>
          addr.id === data.id ? data : addr,
        );
      } else {
        updatedList = [...savedAddresses, data];
      }
      setSavedAddresses(updatedList);

      setSelectedAddressId(data.id);
      setFormData((prev) => ({
        ...prev,
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      }));

      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 1. The Actual Delete Logic (Helper function)
  const executeDelete = async (id) => {
    try {
      const res = await fetch(`/api/address?id=${id}`, { method: 'DELETE' });

      if (res.ok) {
        toast.success('Address removed');
        setSavedAddresses((prev) => prev.filter((addr) => addr.id !== id));

        // Reset selection if the deleted one was selected
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
          setFormData((prev) => ({
            ...prev,
            street: '',
            city: '',
            state: '',
            pincode: '',
          }));
        }
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting address');
    }
  };

  // 2. The Toast Confirmation Trigger
  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();

    // Custom Toast UI
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-stone-600">
            Delete this address?
          </div>
          <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-xs text-stone-400 hover:text-stone-600 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(id);
              }}
              className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000, // Stays for 5 seconds
        position: 'top-center',
        style: {
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E7E5E4',
        },
      },
    );
  };
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all contact details');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error('Please enter a valid email');
        return false;
      }
    }
    if (step === 2) {
      if (
        !formData.street ||
        !formData.city ||
        !formData.state ||
        !formData.pincode
      ) {
        toast.error('Please select or add a shipping address');
        return false;
      }
      if (!/^\d{6}$/.test(formData.pincode)) {
        toast.error('Please enter a valid 6-digit pincode');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setLoading(true);

    try {
      // 1. Sync User Info (Optional, but good for keeping address up to date)
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: formData.name,
          phone: formData.phone,
          gstNumber: formData.gst,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        }),
      });

      // 2. Newsletter Subscription
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          isSubscribed: subscribeNewsletter,
        }),
      });

      // 3. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      // 4. Create Order in Database & Get Razorpay Order ID
      // This step saves the 'PENDING' order with all details (shipping, tax, address)
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          userEmail: user.email,
          userId: user.id || user.uid || user.sub || user.userId,
          customerName: formData.name, // <--- ADDED THIS LINE
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.error || 'Order creation failed');

      // 5. Open Payment Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100, // Razorpay expects amount in paise
        currency: orderData.currency,
        name: 'Bashō Ceramics',
        description: 'Artisan Pottery Checkout',
        image: '/brand/logo-basho.png',
        order_id: orderData.razorpayOrderId,

        handler: async function (response) {
          setPaymentStatus('processing');
          try {
            const verifyRes = await fetch('/api/razorpay', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setIsPaymentSuccess(true);

              setPaymentStatus('success');

              clearCart();

              setTimeout(() => {
                router.push(`/success?orderId=${verifyData.orderId}`);
              }, 2000);
            } else {
              setPaymentStatus('idle');
              toast.error('Payment verification failed');
            }
          } catch (err) {
            setPaymentStatus('idle');
            toast.error('Verification error');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#C85428' },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoading(false);
    }
  };
  const steps = [
    { number: 1, title: 'Contact', icon: <ShieldCheck className="w-5 h-5" /> },
    { number: 2, title: 'Shipping', icon: <MapPin className="w-5 h-5" /> },
    { number: 3, title: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
  ];

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
          <p className="text-stone-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/10 pt-24 pb-16 px-4 md:px-8">
      {/* ADD THIS SECTION 👇 */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && <PaymentOverlay status={paymentStatus} />}
      </AnimatePresence>
      {/* ------------------- */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl md:text-5xl text-[#442D1C] mb-2">
            Secure Checkout
          </h1>
          <p className="text-stone-600">
            Complete your order in a few simple steps
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center max-w-3xl mx-auto">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-[#8E5022] text-white shadow-lg scale-110'
                        : 'bg-white text-stone-400 border-2 border-stone-200'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 font-medium whitespace-nowrap ${
                      currentStep >= step.number
                        ? 'text-[#442D1C]'
                        : 'text-stone-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 mb-6 transition-all duration-300 ${
                      currentStep > step.number
                        ? 'bg-[#8E5022]'
                        : 'bg-stone-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7"
          >
            <form onSubmit={handlePayment} className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Contact Info */}

                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-[#8E5022]" />
                      </div>
                      <h2 className="font-serif text-2xl text-[#442D1C]">
                        Contact Information
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-stone-700">
                            Email Address
                          </label>
                          {/* FEATURE #3: Not You? Link */}
                          <button
                            onClick={() => logout()}
                            className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                          >
                            Not {user?.displayName?.split(' ')[0]}?{' '}
                            <span className="font-medium">Log out</span>
                            <LogOut className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            required
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                            placeholder="+91 98765 43210"
                          />
                          {/* FEATURE #2: Trust Micro-copy */}
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-400">
                            <Info className="w-3 h-3" />
                            <span>
                              Used only for delivery updates. No spam calls.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* FEATURE #1: Newsletter Checkbox */}
                      <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={subscribeNewsletter}
                              onChange={(e) =>
                                setSubscribeNewsletter(e.target.checked)
                              }
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-stone-300 transition-all checked:border-[#8E5022] checked:bg-[#8E5022]"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <span className="text-sm text-stone-600 group-hover:text-[#442D1C] transition-colors">
                            Keep me updated on new collections and exclusive
                            offers from Bashō.
                          </span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="mt-8 w-full bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      Continue to Shipping
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Shipping (Select / Add Logic) */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#8E5022]" />
                      </div>
                      <h2 className="font-serif text-2xl text-[#442D1C]">
                        Shipping Address
                      </h2>
                    </div>

                    {isLoadingAddresses ? (
                      <div className="py-8 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#8E5022]" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Saved Addresses List */}
                        {!showAddressForm &&
                          savedAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectAddress(addr)}
                              className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                                selectedAddressId === addr.id
                                  ? 'border-[#8E5022] bg-[#FDFBF7]'
                                  : 'border-stone-100 hover:border-[#EDD8B4]'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                {/* Left Side: Radio + Text */}
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      selectedAddressId === addr.id
                                        ? 'border-[#8E5022]'
                                        : 'border-stone-300'
                                    }`}
                                  >
                                    {selectedAddressId === addr.id && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-[#8E5022]" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-serif text-[#442D1C] text-lg">
                                      {addr.street}
                                    </p>
                                    <p className="text-stone-600">
                                      {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                    {addr.isDefault && (
                                      <span className="inline-block mt-2 text-[10px] uppercase font-bold text-[#8E5022] bg-[#EDD8B4]/30 px-2 py-1 rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right Side: Buttons Grouped Together (Fixes the gap issue) */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingAddress(addr);
                                      setShowAddressForm(true);
                                    }}
                                    className="p-2 text-stone-400 hover:text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded-full transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleDeleteAddress(addr.id, e)
                                    }
                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* Add New Button */}
                        {!showAddressForm && savedAddresses.length < 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddress(null);
                              setShowAddressForm(true);
                            }}
                            className="w-full py-4 border-2 border-dashed border-[#EDD8B4] rounded-2xl text-[#8E5022] font-medium hover:bg-[#FDFBF7] transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Add New Address
                          </button>
                        )}

                        {/* Limit Message */}
                        {!showAddressForm && savedAddresses.length >= 2 && (
                          <div className="text-center p-3 bg-stone-50 rounded-xl text-stone-500 text-sm">
                            Maximum of 2 addresses allowed. Edit an existing one
                            to change details.
                          </div>
                        )}

                        {/* Address Form */}
                        {showAddressForm && (
                          <div className="mt-4 p-6 bg-stone-50 rounded-2xl border border-stone-200 animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-serif text-lg text-[#442D1C]">
                                {editingAddress
                                  ? 'Edit Address'
                                  : 'New Address'}
                              </h3>
                              {savedAddresses.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddressForm(false);
                                    setEditingAddress(null);
                                  }}
                                  className="text-stone-500 hover:text-red-500 text-sm underline"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold uppercase text-[#8E5022] mb-1">
                                  Street Address
                                </label>
                                <input
                                  name="street"
                                  required
                                  defaultValue={editingAddress?.street}
                                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#8E5022]"
                                  placeholder="123 Zen Lane"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold uppercase text-[#8E5022] mb-1">
                                    City
                                  </label>
                                  <input
                                    name="city"
                                    required
                                    defaultValue={editingAddress?.city}
                                    className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#8E5022]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold uppercase text-[#8E5022] mb-1">
                                    State
                                  </label>
                                  <input
                                    name="state"
                                    required
                                    defaultValue={editingAddress?.state}
                                    className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#8E5022]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase text-[#8E5022] mb-1">
                                  Pincode
                                </label>
                                <input
                                  name="pincode"
                                  required
                                  defaultValue={editingAddress?.pincode}
                                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#8E5022]"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  name="isDefault"
                                  id="checkoutDefault"
                                  defaultChecked={editingAddress?.isDefault}
                                  className="accent-[#8E5022] w-4 h-4"
                                />
                                <label
                                  htmlFor="checkoutDefault"
                                  className="text-sm text-stone-600"
                                >
                                  Set as default
                                </label>
                              </div>

                              <button
                                onClick={handleAddressSubmit}
                                type="button"
                                disabled={loading}
                                className="w-full bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-colors"
                              >
                                {editingAddress
                                  ? 'Update Address'
                                  : 'Save & Deliver Here'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 bg-white border-2 border-stone-200 text-stone-700 py-4 rounded-xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-all"
                      >
                        Back
                      </button>
                      {!showAddressForm && (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="flex-1 bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          Continue to Payment
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#8E5022]" />
                      </div>
                      <h2 className="font-serif text-2xl text-[#442D1C]">
                        Payment Method
                      </h2>
                    </div>

                    <div className="bg-gradient-to-br from-[#8E5022] to-[#652810] rounded-2xl p-6 mb-6">
                      <div className="flex items-center gap-3 text-white mb-4">
                        <Lock className="w-5 h-5" />
                        <span className="font-medium">
                          Secure Payment via Razorpay
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Your payment information is encrypted and secure. We
                        accept all major cards, UPI, net banking, and wallets.
                      </p>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-6 mb-6">
                      <h3 className="font-medium text-stone-700 mb-4">
                        Order Summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-stone-600">
                          <span>Contact:</span>
                          <span className="font-medium text-stone-800">
                            {formData.email}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Ship to:</span>
                          <span className="font-medium text-stone-800 text-right">
                            {formData.street}, {formData.city}, {formData.state}{' '}
                            - {formData.pincode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={loading}
                        className="flex-1 bg-white border-2 border-stone-200 text-stone-700 py-4 rounded-xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || cartItems.length === 0}
                        className="flex-1 bg-[#C85428] text-white py-4 rounded-xl font-medium hover:bg-[#A03D1A] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Pay ₹{totalAmount.toFixed(2)}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* RIGHT: Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-2xl text-[#442D1C]">
                    Your Order
                  </h3>
                  <span className="bg-[#EDD8B4] text-[#8E5022] text-sm px-3 py-1 rounded-full font-medium">
                    {getTotalItems()} items
                  </span>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-stone-50 rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-stone-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-stone-800 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-stone-500">
                          {item.category}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-stone-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-medium text-[#8E5022]">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-4 space-y-3">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>GST (5%)</span>
                    <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span className="font-medium">
                      {shippingCost === 0
                        ? 'Free'
                        : `₹${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
                    <span className="font-serif text-lg text-[#442D1C]">
                      Total
                    </span>
                    <span className="font-serif text-2xl text-[#442D1C]">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-6 border border-stone-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#8E5022]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-800 mb-1">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-stone-600">
                      Your payment information is encrypted and processed
                      securely through Razorpay.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/products">
                <button className="w-full bg-transparent border-2 border-stone-200 text-stone-700 py-3 rounded-xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-all">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8e5022;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #652810;
        }
      `}</style>
    </div>
  );
}
