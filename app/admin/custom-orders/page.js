"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

export default function AdminCustomOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadOrders();
    }
  }, [user, filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/custom-orders?status=${filter !== "all" ? filter : ""}`
      );

      if (!response.ok) throw new Error("Failed to load orders");

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-[#442D1C] mb-4">
            Access Denied
          </h2>
          <p className="text-stone-600">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800";
      case "QUOTED":
        return "bg-purple-100 text-purple-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-indigo-100 text-indigo-800";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#442D1C] mb-2">
            Custom Orders
          </h1>
          <p className="text-stone-600">
            Manage and review custom order requests
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {[
            "all",
            "PENDING",
            "REVIEWED",
            "QUOTED",
            "IN_PROGRESS",
            "COMPLETED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-medium ${
                filter === status
                  ? "bg-[#8E5022] text-white"
                  : "bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              {status === "all" ? "All Orders" : status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin mx-auto" />
              <p className="text-stone-600 mt-4">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-stone-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left p-4">Order ID</th>
                    <th className="text-left p-4">Product Type</th>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-stone-100 hover:bg-stone-50"
                    >
                      <td className="p-4">
                        <div className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{order.productType}</div>
                        <div className="text-sm text-stone-500">
                          Qty: {order.quantity} • {order.material}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{order.contactName}</div>
                        <div className="text-sm text-stone-500">
                          {order.contactEmail}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/custom-orders/${order.id}`}
                          className="inline-flex items-center gap-2 bg-[#8E5022] text-white px-4 py-2 rounded-xl hover:bg-[#652810] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
