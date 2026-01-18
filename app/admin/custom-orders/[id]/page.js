"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  DollarSign,
  MessageSquare,
  Save,
  Send,
  Printer,
  User,
  Star,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Package,
  Clipboard,
  Edit2,
  CheckCircle,
  MapPin,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

export default function AdminCustomOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showcaseWorthy, setShowcaseWorthy] = useState(false);

  // Form States
  const [adminNotes, setAdminNotes] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");
  const [status, setStatus] = useState("PENDING");

  // NEW: Payment States
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [paymentId, setPaymentId] = useState("");

  const statusOptions = [
    "PENDING",
    "REVIEWED",
    "QUOTED",
    "APPROVED",
    "IN_PROGRESS",
    "COMPLETED",
    "SHIPPED",
    "CANCELLED",
  ];

  // Find your loadOrder function and update it to include these lines:
  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/custom-orders/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/custom-orders");
          toast.error("Order not found");
          return;
        }
        throw new Error("Failed to load order");
      }

      const data = await response.json();
      setOrder(data);

      setAdminNotes(data.adminNotes || "");
      setEstimatedPrice(data.estimatedPrice || "");
      setActualPrice(data.actualPrice || "");
      setEstimatedCompletion(data.estimatedCompletion || "");
      setStatus(data.status || "PENDING");

      // Load Payment Info
      setPaymentStatus(data.paymentStatus || "PENDING");
      setPaymentId(data.paymentId || "");

      // ⭐ ADD THIS LINE
      setShowcaseWorthy(data.showcaseWorthy || false);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadOrder();
    }
  }, [user, loadOrder]);

  // Update your handleUpdate function:
  const handleUpdate = async () => {
    if (!order) return;

    try {
      setIsUpdating(true);

      const updateData = {
        status,
        adminNotes,
        estimatedCompletion,
        paymentStatus,
        paymentId,
        showcaseWorthy, // ⭐ ADD THIS LINE
        ...(estimatedPrice && { estimatedPrice: parseFloat(estimatedPrice) }),
        ...(actualPrice && { actualPrice: parseFloat(actualPrice) }),
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success("Order updated successfully");
      setIsEditing(false);
      loadOrder();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendQuote = async () => {
    if (!order || !estimatedPrice) {
      toast.error("Please enter an estimated price");
      return;
    }

    try {
      setIsUpdating(true);

      const updateData = {
        status: "QUOTED",
        estimatedPrice: parseFloat(estimatedPrice),
        actualPrice: actualPrice
          ? parseFloat(actualPrice)
          : parseFloat(estimatedPrice),
        adminNotes: adminNotes || `Quote sent: ₹${estimatedPrice}`,
        estimatedCompletion,
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to send quote");

      toast.success(`Quote of ₹${estimatedPrice} sent`);
      setIsEditing(false);
      loadOrder();
    } catch (error) {
      console.error("Error sending quote:", error);
      toast.error("Failed to send quote");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-800 border-yellow-100";
      case "REVIEWED":
        return "bg-blue-50 text-blue-800 border-blue-100";
      case "QUOTED":
        return "bg-purple-50 text-purple-800 border-purple-100";
      case "APPROVED":
        return "bg-green-50 text-green-800 border-green-100";
      case "IN_PROGRESS":
        return "bg-indigo-50 text-indigo-800 border-indigo-100";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      default:
        return "bg-stone-50 text-stone-800 border-stone-100";
    }
  };

  if (authLoading || loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8E5022]" />
      </div>
    );
  if (!user || user.role !== "ADMIN")
    return <div className="p-8 text-center">Access Denied</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto print:hidden">
        {/* Responsive Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-start gap-3 md:gap-4 w-full md:w-auto">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white border border-[#EDD8B4] rounded-xl hover:bg-[#FDFBF7] text-[#8E5022] transition-colors shadow-sm shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C] truncate">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-[#8E5022] text-xs md:text-sm mt-1 flex items-center gap-2">
                <Calendar size={14} className="shrink-0" />
                <span>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-5 py-3 md:py-2.5 rounded-xl font-bold text-sm hover:bg-[#2c1d12] transition-all shadow-lg active:scale-95"
              >
                <Edit2 size={16} /> Manage Order
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-white border border-[#EDD8B4] text-[#442D1C] px-5 py-3 md:py-2.5 rounded-xl font-bold text-sm hover:bg-[#FDFBF7] transition-colors active:scale-95"
            >
              <Printer size={16} /> Print Invoice
            </button>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column (Details & Actions) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Request Details */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
              <h3 className="font-serif text-lg md:text-xl font-bold text-[#442D1C] mb-4 md:mb-6 flex items-center gap-2">
                <Package className="text-[#C85428]" /> Request Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Product
                    </p>
                    <p className="text-[#442D1C] font-medium text-lg">
                      {order.productType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Material
                    </p>
                    <p className="text-[#442D1C] capitalize">
                      {order.material}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Qty
                    </p>
                    <p className="text-[#442D1C]">{order.quantity} Units</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {order.dimensions && (
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                        Dimensions
                      </p>
                      <div className="flex flex-wrap gap-2 md:gap-3 text-sm text-[#442D1C] bg-[#FDFBF7] p-3 rounded-lg border border-[#EDD8B4]/50">
                        <span>H: {order.dimensions.height || "-"}</span>
                        <span className="text-[#EDD8B4]">|</span>
                        <span>W: {order.dimensions.width || "-"}</span>
                        <span className="text-[#EDD8B4]">|</span>
                        <span>D: {order.dimensions.depth || "-"}</span>
                      </div>
                    </div>
                  )}
                  {order.colorPreferences && (
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Colors
                      </p>
                      <p className="text-[#442D1C] text-sm">
                        {order.colorPreferences}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Actions Panel */}
            <div
              className={`bg-white p-5 md:p-6 rounded-2xl border shadow-sm transition-all ${
                isEditing
                  ? "border-[#C85428] ring-1 ring-[#C85428]/20"
                  : "border-[#EDD8B4]"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg md:text-xl font-bold text-[#442D1C] flex items-center gap-2">
                  <MessageSquare className="text-[#C85428]" /> Admin Actions
                </h3>
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-bold text-[#8E5022] uppercase hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Update Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] transition-colors"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Est. Completion
                      </label>
                      <input
                        type="text"
                        value={estimatedCompletion}
                        onChange={(e) => setEstimatedCompletion(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] transition-colors"
                        placeholder="e.g. 2 Weeks"
                      />
                    </div>
                  </div>

                  {/* Payment Status & ID Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Payment Status
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full p-3 bg-white border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] transition-colors"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>
                    {paymentStatus === "PAID" && (
                      <div>
                        <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          value={paymentId}
                          onChange={(e) => setPaymentId(e.target.value)}
                          className="w-full p-3 bg-white border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] transition-colors"
                          placeholder="Manual / Razorpay ID"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Estimated Price (₹)
                      </label>
                      <input
                        type="number"
                        value={estimatedPrice}
                        onChange={(e) => setEstimatedPrice(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Final Price (₹)
                      </label>
                      <input
                        type="number"
                        value={actualPrice}
                        onChange={(e) => setActualPrice(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] transition-colors"
                        placeholder="For payment"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                      Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none focus:border-[#C85428] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 border-t border-[#EDD8B4]/30">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="flex-1 bg-[#442D1C] text-[#EDD8B4] py-3 rounded-xl font-bold hover:bg-[#2c1d12] transition-colors disabled:opacity-70 active:scale-95"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                    {status === "QUOTED" && (
                      <button
                        onClick={handleSendQuote}
                        disabled={isUpdating || !estimatedPrice}
                        className="flex-1 bg-[#C85428] text-white py-3 rounded-xl font-bold hover:bg-[#a04320] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Send size={18} /> Send Quote Email
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#FDFBF7] p-4 rounded-xl border border-[#EDD8B4]/50">
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Est. Price
                      </p>
                      <p className="text-lg font-bold text-[#442D1C]">
                        {estimatedPrice ? `₹${estimatedPrice}` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Final Price
                      </p>
                      <p className="text-lg font-bold text-[#442D1C]">
                        {actualPrice ? `₹${actualPrice}` : "-"}
                      </p>
                    </div>
                    <div className="sm:col-span-2 md:col-span-1">
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Completion
                      </p>
                      <p className="text-[#442D1C]">
                        {estimatedCompletion || "-"}
                      </p>
                    </div>
                  </div>
                  {order.adminNotes && (
                    <p className="text-stone-600 bg-stone-50 p-3 rounded-lg italic">
                      "{order.adminNotes}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Information Card (Shows when PAID) */}
            {order.paymentStatus === "PAID" && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-start sm:items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">
                      Payment Received
                    </h3>
                    <p className="text-green-600 text-sm">
                      Order confirmed & ready for production
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm sm:pl-13">
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <p className="text-xs font-bold text-green-600 uppercase">
                      Amount Paid
                    </p>
                    <p className="text-lg font-bold text-green-800">
                      ₹{order.actualPrice}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100 overflow-hidden">
                    <p className="text-xs font-bold text-green-600 uppercase">
                      Transaction ID
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-green-800 font-mono truncate">
                        {order.paymentId || "Manual"}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.paymentId);
                          toast.success("Copied ID");
                        }}
                        className="text-green-500 hover:text-green-700 shrink-0"
                      >
                        <Clipboard size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add this right after the Payment Information Card */}
            {/* Showcase Toggle - Only show for COMPLETED orders */}
            {order.status === "COMPLETED" && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star
                        className={`w-6 h-6 ${
                          showcaseWorthy
                            ? "text-purple-600 fill-purple-600"
                            : "text-purple-300"
                        }`}
                      />
                      <h3 className="font-bold text-purple-800 text-lg">
                        Customer Showcase
                      </h3>
                    </div>
                    <p className="text-purple-600 text-sm mb-4">
                      {showcaseWorthy
                        ? "This order is currently displayed in the customer showcase gallery"
                        : "Enable to display this completed order on the custom order page"}
                    </p>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showcaseWorthy}
                          onChange={async (e) => {
                            const newValue = e.target.checked;
                            setShowcaseWorthy(newValue);

                            try {
                              const response = await fetch(
                                `/api/custom-orders/${params.id}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    status: order.status,
                                    showcaseWorthy: newValue,
                                    adminNotes: order.adminNotes,
                                    estimatedPrice: order.estimatedPrice,
                                    actualPrice: order.actualPrice,
                                    estimatedCompletion:
                                      order.estimatedCompletion,
                                    paymentStatus: order.paymentStatus,
                                    paymentId: order.paymentId,
                                  }),
                                }
                              );

                              if (response.ok) {
                                toast.success(
                                  newValue
                                    ? "✨ Added to showcase gallery"
                                    : "Removed from showcase gallery"
                                );
                                loadOrder(); // Refresh order data
                              } else {
                                // Revert on failure
                                setShowcaseWorthy(!newValue);
                                toast.error("Failed to update showcase status");
                              }
                            } catch (error) {
                              console.error("Error updating showcase:", error);
                              setShowcaseWorthy(!newValue); // Revert on error
                              toast.error("Error updating showcase status");
                            }
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            showcaseWorthy ? "bg-purple-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              showcaseWorthy
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            } mt-0.5`}
                          ></div>
                        </div>
                      </div>
                      <span className="font-medium text-purple-800 group-hover:text-purple-900">
                        {showcaseWorthy
                          ? "Featured in Gallery"
                          : "Add to Gallery"}
                      </span>
                    </label>
                  </div>

                  {showcaseWorthy && (
                    <div className="bg-purple-100 px-3 py-1 rounded-full text-xs font-bold text-purple-700 uppercase tracking-wider shrink-0">
                      Live
                    </div>
                  )}
                </div>

                {showcaseWorthy && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-xs text-purple-600 font-medium flex items-center gap-2">
                      <CheckCircle size={14} />
                      Customers can now see this project on the custom order
                      page
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Customer & Meta) */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4 flex items-center gap-2">
                <User size={18} /> Customer
              </h3>
              <div className="mb-4">
                <p className="font-bold text-[#442D1C] text-lg">
                  {order.contactName}
                </p>
                <a
                  href={`mailto:${order.contactEmail}`}
                  className="text-sm text-[#C85428] hover:underline block break-all"
                >
                  {order.contactEmail}
                </a>
                <a
                  href={`tel:${order.contactPhone}`}
                  className="text-sm text-stone-500 hover:text-[#442D1C] block mt-1"
                >
                  {order.contactPhone}
                </a>
              </div>
            </div>

            {/* Quick Tools */}
            <div className="bg-[#442D1C] p-5 md:p-6 rounded-2xl text-[#EDD8B4] shadow-lg">
              <h3 className="font-serif text-lg font-bold mb-4">Quick Tools</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.id);
                    toast.success("Order ID copied");
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm active:bg-white/20"
                >
                  <Package size={16} /> Copy Order ID
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `mailto:${
                        order.contactEmail
                      }?subject=Re: Custom Order #${order.id.slice(0, 8)}`
                    )
                  }
                  className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm active:bg-white/20"
                >
                  <Mail size={16} /> Email Customer
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4">
                Timeline
              </h3>
              <div className="space-y-6 relative pl-2">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#EDD8B4]/50"></div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#EDD8B4] border-2 border-white"></div>
                  <p className="text-xs font-bold text-[#8E5022] uppercase">
                    Created
                  </p>
                  <p className="text-sm text-[#442D1C]">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#C85428] border-2 border-white shadow-sm"></div>
                  <p className="text-xs font-bold text-[#8E5022] uppercase">
                    Last Update
                  </p>
                  <p className="text-sm text-[#442D1C]">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* References */}
            {order.files && order.files.length > 0 && (
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
                <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4 flex items-center gap-2">
                  <Clipboard size={18} /> References
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {order.files.map((file, i) => (
                    <a
                      key={i}
                      href={file}
                      target="_blank"
                      className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 block hover:opacity-80"
                    >
                      <img src={file} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print View - Kept largely same but responsive within print context if needed */}
      <div className="hidden print:block max-w-[210mm] mx-auto bg-white p-8">
        <div className="flex justify-between items-start border-b-2 border-[#442D1C] pb-8 mb-8">
          <div>
            <h1 className="text-5xl font-serif font-bold text-[#442D1C] mb-2">
              Bashō.
            </h1>
            <p className="text-stone-600 text-sm">
              Handcrafted Japanese Ceramics
            </p>
            <div className="flex items-center gap-2 text-sm text-stone-500 mt-2">
              <MapPin size={14} /> <span>Studio Bashō, Surat, Gujarat</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Mail size={14} /> <span>hello@bashoceramics.com</span>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-[#8E5022] uppercase tracking-widest mb-1">
              INVOICE
            </h2>
            <p className="font-mono text-lg text-[#442D1C]">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-stone-500 text-sm mt-1">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mb-12">
          <h3 className="text-xs font-bold text-[#8E5022] uppercase tracking-wider mb-2">
            Bill To
          </h3>
          <p className="text-xl font-bold text-[#442D1C]">
            {order.contactName}
          </p>
          <p className="text-stone-600">{order.contactEmail}</p>
          <p className="text-stone-600">{order.contactPhone}</p>
        </div>
        <table className="w-full mb-12">
          <thead className="bg-[#FDFBF7] text-[#8E5022] uppercase text-xs font-bold">
            <tr>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Details</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <tr>
              <td className="py-4 px-4 align-top">
                <p className="font-bold text-[#442D1C] text-lg mb-1">
                  Custom Commission
                </p>
                <p className="text-stone-500 text-sm">{order.productType}</p>
              </td>
              <td className="py-4 px-4 align-top text-sm text-stone-600">
                <p>
                  Material:{" "}
                  <span className="font-medium text-[#442D1C] capitalize">
                    {order.material}
                  </span>
                </p>
                {order.glaze && <p>Finish: {order.glaze}</p>}
                <p>Quantity: {order.quantity}</p>
              </td>
              <td className="py-4 px-4 text-right align-top font-bold text-[#442D1C] text-lg">
                ₹{order.actualPrice || 0}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end mb-16">
          <div className="w-64">
            <div className="flex justify-between py-4 text-xl font-bold text-[#442D1C]">
              <span>Total</span>
              <span>₹{order.actualPrice || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
          }
          body {
            background: white;
          }
          nav,
          footer,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
