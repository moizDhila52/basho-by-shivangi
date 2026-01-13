"use client";

<<<<<<< HEAD
import { useState } from 'react';
import { useRazorpay } from 'react-razorpay';
import { AlertCircle, RefreshCw } from 'lucide-react'; // Assuming you have lucide-react icons
=======
import { useState } from "react";
import { useRazorpay } from "react-razorpay";
import { AlertCircle, RefreshCw } from "lucide-react"; // Assuming you have lucide-react icons
>>>>>>> 10ee6a3b04a9ad159438e8e0f01eb67ab9e9df99

export default function OrderPaymentStatus({ order }) {
  const { Razorpay } = useRazorpay();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryPayment = () => {
    setIsRetrying(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.total * 100, // Amount in paise
      currency: "INR",
      name: "Basho Ceramics",
      description: `Retry Payment for Order #${order.id.slice(0, 8)}`,
      order_id: order.razorpayOrderId, // Reuse existing Order ID

      handler: async function (response) {
        try {
          const res = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (res.ok) {
            window.location.reload();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        } catch (err) {
          console.error(err);
          alert("Something went wrong verifying the payment.");
        } finally {
          setIsRetrying(false);
        }
      },
      prefill: {
        name: order.customerName,
        email: order.customerEmail,
        contact: order.customerPhone,
      },
      theme: { color: "#C85428" },
      modal: {
        ondismiss: () => setIsRetrying(false),
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
  };

  // Only render if status is PENDING or CONFIRMED (to show success msg)
  if (order.status !== "PENDING" && order.status !== "CONFIRMED") return null;

  return (
    <div className="mb-6">
      {/* PENDING STATE */}
      {order.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-full text-amber-700 mt-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Payment Pending
              </h3>

              <p className="text-amber-800 mb-4 text-sm leading-relaxed">
                We have reserved the items for you, but we haven't received the
                payment confirmation yet.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/60 p-4 rounded-lg border border-amber-100">
                  <p className="font-bold text-amber-900 text-xs uppercase mb-1">
                    Scenario 1: Money NOT Deducted
                  </p>
                  <p className="text-sm text-amber-800">
                    If the transaction failed or you cancelled it, please click
                    the button below to complete your purchase.
                  </p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg border border-amber-100">
                  <p className="font-bold text-amber-900 text-xs uppercase mb-1">
                    Scenario 2: Money Was Deducted
                  </p>
                  <p className="text-sm text-amber-800">
                    Do <strong>NOT</strong> pay again. Your order will
                    auto-confirm within 30 minutes, or you can contact support.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>Processing...</>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Pay Now (Retry)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMED STATE (Optional success message) */}
      {order.status === "CONFIRMED" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-700">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-sm">
              Payment Verified
            </h3>
            <p className="text-xs text-emerald-700">
              We have successfully received your payment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
