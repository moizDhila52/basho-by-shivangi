"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Palette,
  Ruler,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Send,
  Download,
  Printer,
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  Shield,
  Package,
  Truck,
  Clipboard,
  Home,
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
  const [adminNotes, setAdminNotes] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [status, setStatus] = useState("PENDING");

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
      setStatus(data.status || "PENDING");
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

  const handleUpdate = async () => {
    if (!order) return;

    try {
      setIsUpdating(true);

      const updateData = {
        status,
        adminNotes,
        ...(estimatedPrice && { estimatedPrice: parseFloat(estimatedPrice) }),
        ...(status === "QUOTED" && { actualPrice: parseFloat(estimatedPrice) }),
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success("Order updated successfully");
      setIsEditing(false);
      loadOrder(); // Refresh data
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
        actualPrice: parseFloat(estimatedPrice),
        adminNotes: adminNotes || `Quote sent: $${estimatedPrice}`,
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send quote");
      }

      // Here you would typically send an email to the customer
      // For now, we'll just show a success message
      toast.success(`Quote of $${estimatedPrice} sent to customer`);
      setIsEditing(false);
      loadOrder();
    } catch (error) {
      console.error("Error sending quote:", error);
      toast.error(error.message || "Failed to send quote");
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "QUOTED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "REVIEWED":
        return <MessageSquare className="w-4 h-4" />;
      case "QUOTED":
        return <DollarSign className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Package className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "SHIPPED":
        return <Truck className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
          <p className="text-stone-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-[#8E5022] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-[#442D1C] mb-2">
            Access Denied
          </h2>
          <p className="text-stone-600">Admin access required.</p>
          <Link
            href="/admin/custom-orders"
            className="inline-block mt-6 bg-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#C85428] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-[#442D1C] mb-2">
            Order Not Found
          </h2>
          <Link
            href="/admin/custom-orders"
            className="inline-block mt-6 bg-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/custom-orders"
                className="w-10 h-10 rounded-xl bg-white border-2 border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-stone-600" />
              </Link>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-[#442D1C]">
                  Order #{order.id.slice(0, 8)}...
                </h1>
                <p className="text-stone-600">
                  Created{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white border-2 border-[#8E5022] text-[#8E5022] px-4 py-2 rounded-xl font-medium hover:bg-[#8E5022]/10 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white border-2 border-stone-300 text-stone-600 px-4 py-2 rounded-xl font-medium hover:bg-stone-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusIcon(order.status)}
            <span className="font-medium">{order.status}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-[#8E5022]" />
                <h2 className="font-serif text-2xl text-[#442D1C]">
                  Order Details
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-stone-700 mb-3">
                    Product Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-stone-500">
                        Product Type
                      </label>
                      <p className="font-medium">{order.productType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-stone-500">Quantity</label>
                      <p className="font-medium">
                        {order.quantity} piece{order.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-stone-500">Material</label>
                      <p className="font-medium capitalize">{order.material}</p>
                    </div>
                    {order.glaze && (
                      <div>
                        <label className="text-sm text-stone-500">
                          Glaze/Finish
                        </label>
                        <p className="font-medium capitalize">{order.glaze}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-stone-700 mb-3">
                    Dimensions
                  </h3>
                  <div className="space-y-3">
                    {order.dimensions &&
                    typeof order.dimensions === "object" ? (
                      <>
                        {order.dimensions.height && (
                          <div>
                            <label className="text-sm text-stone-500">
                              Height
                            </label>
                            <p className="font-medium">
                              {order.dimensions.height} cm
                            </p>
                          </div>
                        )}
                        {order.dimensions.width && (
                          <div>
                            <label className="text-sm text-stone-500">
                              Width
                            </label>
                            <p className="font-medium">
                              {order.dimensions.width} cm
                            </p>
                          </div>
                        )}
                        {order.dimensions.depth && (
                          <div>
                            <label className="text-sm text-stone-500">
                              Depth
                            </label>
                            <p className="font-medium">
                              {order.dimensions.depth} cm
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-stone-500 italic">
                        No dimensions specified
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="grid md:grid-cols-2 gap-6">
                  {order.colorPreferences && (
                    <div>
                      <h3 className="font-medium text-stone-700 mb-2">
                        Color Preferences
                      </h3>
                      <p className="text-stone-600">{order.colorPreferences}</p>
                    </div>
                  )}

                  {order.specialRequirements && (
                    <div>
                      <h3 className="font-medium text-stone-700 mb-2">
                        Special Requirements
                      </h3>
                      <p className="text-stone-600">
                        {order.specialRequirements}
                      </p>
                    </div>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4">
                    <h3 className="font-medium text-stone-700 mb-2">
                      Additional Notes
                    </h3>
                    <p className="text-stone-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reference Images */}
            {order.files && order.files.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="w-6 h-6 text-[#8E5022]" />
                  <h2 className="font-serif text-2xl text-[#442D1C]">
                    Reference Images
                  </h2>
                  <span className="text-sm text-stone-500">
                    ({order.files.length} image
                    {order.files.length > 1 ? "s" : ""})
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {order.files.map((file, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative group"
                    >
                      <img
                        src={file}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                          <Download className="w-6 h-6 text-white" />
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes & Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-[#8E5022]" />
                  <h2 className="font-serif text-2xl text-[#442D1C]">
                    Admin Notes & Actions
                  </h2>
                </div>

                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-sm text-stone-500 hover:text-[#C85428] transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Update Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Estimate */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Estimated Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="number"
                        value={estimatedPrice}
                        onChange={(e) => setEstimatedPrice(e.target.value)}
                        placeholder="Enter estimated price"
                        className="w-full pl-12 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      placeholder="Add internal notes, customer communication, or production details..."
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-[#8E5022] focus:outline-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="flex-1 bg-[#8E5022] text-white py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>

                    {status === "QUOTED" && (
                      <button
                        onClick={handleSendQuote}
                        disabled={isUpdating || !estimatedPrice}
                        className="flex-1 bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send Quote
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="space-y-6">
                  {/* Current Admin Notes */}
                  {order.adminNotes ? (
                    <div className="bg-stone-50 rounded-xl p-4">
                      <h3 className="font-medium text-stone-700 mb-2">
                        Current Notes
                      </h3>
                      <p className="text-stone-600 whitespace-pre-wrap">
                        {order.adminNotes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">No admin notes yet</p>
                  )}

                  {/* Price Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-stone-700 mb-2">
                        Estimated Price
                      </h3>
                      <p className="text-2xl font-medium text-[#442D1C]">
                        {order.estimatedPrice
                          ? `$${order.estimatedPrice.toFixed(2)}`
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-700 mb-2">
                        Actual Price
                      </h3>
                      <p className="text-2xl font-medium text-[#442D1C]">
                        {order.actualPrice
                          ? `$${order.actualPrice.toFixed(2)}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="font-medium text-stone-700 mb-3">
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-stone-600">Order Created</span>
                        <span className="font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-600">Deadline</span>
                        <span className="font-medium">
                          {order.deadline || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-600">Budget Range</span>
                        <span className="font-medium">
                          {order.budgetRange || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Customer & Quick Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-[#8E5022]" />
                <h2 className="font-serif text-2xl text-[#442D1C]">Customer</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-[#8E5022]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#442D1C]">
                      {order.contactName}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {order.User ? "Registered User" : "Guest Customer"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <a
                      href={`mailto:${order.contactEmail}`}
                      className="text-[#8E5022] hover:underline"
                    >
                      {order.contactEmail}
                    </a>
                  </div>

                  {order.contactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-stone-400" />
                      <a
                        href={`tel:${order.contactPhone}`}
                        className="text-[#8E5022] hover:underline"
                      >
                        {order.contactPhone}
                      </a>
                    </div>
                  )}

                  {order.User?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600">{order.User.phone}</span>
                    </div>
                  )}
                </div>

                {order.User && (
                  <div className="pt-4 border-t border-stone-200">
                    <h4 className="font-medium text-stone-700 mb-2">
                      User Information
                    </h4>
                    <p className="text-sm text-stone-600">
                      User ID: {order.User.id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-stone-600">
                      Registered since{" "}
                      {new Date(order.User.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#8E5022] to-[#652810] rounded-3xl p-6 text-white">
              <h3 className="font-serif text-xl mb-6">Quick Actions</h3>

              <div className="space-y-4">
                <button
                  onClick={() =>
                    window.open(
                      `mailto:${
                        order.contactEmail
                      }?subject=Custom Order #${order.id.slice(0, 8)}...`,
                      "_blank"
                    )
                  }
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Email Customer</div>
                    <div className="text-sm opacity-80">
                      Send updates or questions
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.id);
                    toast.success("Order ID copied to clipboard");
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Copy Order ID</div>
                    <div className="text-sm opacity-80">
                      {order.id.slice(0, 8)}...
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const text = `Custom Order Details:\nOrder ID: ${
                      order.id
                    }\nCustomer: ${order.contactName}\nProduct: ${
                      order.productType
                    }\nStatus: ${order.status}\nPrice: ${
                      order.estimatedPrice
                        ? `$${order.estimatedPrice}`
                        : "Not set"
                    }`;
                    navigator.clipboard.writeText(text);
                    toast.success("Order summary copied");
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors"
                >
                  <Clipboard className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Copy Summary</div>
                    <div className="text-sm opacity-80">
                      Order details for notes
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Timeline Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <h3 className="font-serif text-xl text-[#442D1C] mb-6">
                Order Timeline
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#8E5022]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#442D1C]">
                      Order Created
                    </div>
                    <div className="text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <div className="font-medium text-stone-600">
                      Last Updated
                    </div>
                    <div className="text-sm text-stone-500">
                      {new Date(order.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {order.deadline && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EDD8B4]/50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-[#8E5022]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#442D1C]">
                        Customer Deadline
                      </div>
                      <div className="text-sm text-stone-500">
                        {order.deadline}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          nav,
          button,
          .no-print {
            display: none !important;
          }

          .print-container {
            padding: 0 !important;
            max-width: 100% !important;
          }

          .print-break {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
