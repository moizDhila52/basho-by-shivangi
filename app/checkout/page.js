"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  MapPin,
  Package,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Edit2,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    removeAll,
    isUpdating,
    loading: cartLoading,
  } = useCart();

  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    gst: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Cost Calculation
  const totalWeight = cartItems.length * 0.5;
  const shippingCost =
    totalWeight <= 0
      ? 0
      : totalWeight <= 1
      ? 100
      : 100 + (totalWeight - 1) * 50;
  const subtotal = getTotalPrice();
  const gstAmount = subtotal * 0.05;
  const totalAmount = subtotal + gstAmount + shippingCost;

  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
      router.push("/login?returnUrl=/checkout");
      return;
    }

    if (cartItems.length === 0 && !cartLoading) {
      toast.error("Your cart is empty");
      router.push("/products");
      return;
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user, cartItems.length, router, cartLoading]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error("Please fill in all contact details");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error("Please enter a valid email");
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
        toast.error("Please fill in all shipping details");
        return false;
      }
      if (!/^\d{6}$/.test(formData.pincode)) {
        toast.error("Please enter a valid 6-digit pincode");
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
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);

    try {
      // 1. Sync User & Address to Database
      const syncRes = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (!syncRes.ok) throw new Error("Failed to save address");

      // 2. Load Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");

      // 3. Create Order
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const order = await res.json();
      if (!order.id) throw new Error("Order creation failed");

      // 4. Open Payment Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Bashō Ceramics",
        description: "Artisan Pottery Checkout",
        image: "/brand/logo-basho.png",
        order_id: order.id,
        handler: async function (response) {
          // Verify Payment
          const verifyRes = await fetch("/api/razorpay", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            removeAll();
            router.push("/success");
          } else {
            toast.error("Payment verification failed!");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#C85428" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Contact", icon: <ShieldCheck className="w-5 h-5" /> },
    { number: 2, title: "Shipping", icon: <MapPin className="w-5 h-5" /> },
    { number: 3, title: "Payment", icon: <CreditCard className="w-5 h-5" /> },
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
                        ? "bg-[#8E5022] text-white shadow-lg scale-110"
                        : "bg-white text-stone-400 border-2 border-stone-200"
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
                        ? "text-[#442D1C]"
                        : "text-stone-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 mb-6 transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-[#8E5022]"
                        : "bg-stone-200"
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
              {/* Step 1: Contact Info */}
              <AnimatePresence mode="wait">
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
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Email Address
                        </label>
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
                        </div>
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

                {/* Step 2: Shipping */}
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

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          required
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                          placeholder="Flat / House No / Street"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            City *
                          </label>
                          <input
                            required
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                            placeholder="Mumbai"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Pincode *
                          </label>
                          <input
                            required
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                            placeholder="400001"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          State *
                        </label>
                        <input
                          required
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                          placeholder="Maharashtra"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          GST Number (Optional)
                        </label>
                        <input
                          type="text"
                          name="gst"
                          value={formData.gst}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#8E5022] focus:ring-2 focus:ring-[#8E5022]/20 transition-all"
                          placeholder="GSTIN (Optional)"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 bg-white border-2 border-stone-200 text-stone-700 py-4 rounded-xl font-medium hover:border-[#8E5022] hover:text-[#8E5022] transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        Continue to Payment
                        <ArrowRight className="w-5 h-5" />
                      </button>
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

                    {/* Order Review */}
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
                            {formData.street}, {formData.city}, {formData.state}{" "}
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
              {/* Cart Items */}
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
                        ? "Free"
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

              {/* Security Badge */}
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

              {/* Return to Shop */}
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
