'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit2,
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
  Info,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';

export default function AdminCustomOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [actualPrice, setActualPrice] = useState(''); // <--- NEW STATE
  const [status, setStatus] = useState('PENDING');

  const statusOptions = [
    'PENDING',
    'REVIEWED',
    'QUOTED',
    'APPROVED',
    'IN_PROGRESS',
    'COMPLETED',
    'SHIPPED',
    'CANCELLED',
  ];

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/custom-orders/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/custom-orders');
          toast.error('Order not found');
          return;
        }
        throw new Error('Failed to load order');
      }

      const data = await response.json();
      setOrder(data);
      // Initialize inputs with database values
      setAdminNotes(data.adminNotes || '');
      setEstimatedPrice(data.estimatedPrice || '');
      setActualPrice(data.actualPrice || ''); // <--- LOAD FINAL PRICE
      setStatus(data.status || 'PENDING');
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
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
        // Only send if they have values
        ...(estimatedPrice && { estimatedPrice: parseFloat(estimatedPrice) }),
        ...(actualPrice && { actualPrice: parseFloat(actualPrice) }), // <--- UPDATE FINAL PRICE
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      toast.success('Order updated successfully');
      setIsEditing(false);
      loadOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendQuote = async () => {
    if (!order || !estimatedPrice) {
      toast.error('Please enter an estimated price');
      return;
    }

    try {
      setIsUpdating(true);

      const updateData = {
        status: 'QUOTED',
        estimatedPrice: parseFloat(estimatedPrice),
        // If Actual Price is empty, default it to Estimated Price for convenience
        actualPrice: actualPrice
          ? parseFloat(actualPrice)
          : parseFloat(estimatedPrice),
        adminNotes: adminNotes || `Quote sent: ₹${estimatedPrice}`,
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send quote');
      }

      toast.success(`Quote of ₹${estimatedPrice} sent to customer`);
      setIsEditing(false);
      loadOrder();
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error(error.message || 'Failed to send quote');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border-yellow-100';
      case 'REVIEWED':
        return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'QUOTED':
        return 'bg-purple-50 text-purple-800 border-purple-100';
      case 'APPROVED':
        return 'bg-green-50 text-green-800 border-green-100';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-800 border-indigo-100';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'SHIPPED':
        return 'bg-teal-50 text-teal-800 border-teal-100';
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-100';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-100';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
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
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white border border-[#EDD8B4] rounded-xl hover:bg-[#FDFBF7] text-[#8E5022] transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[#8E5022] text-sm mt-1 flex items-center gap-2">
              <Calendar size={14} />
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#2c1d12] transition-all shadow-lg"
            >
              <Edit2 size={16} /> Manage Order
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-[#EDD8B4] text-[#442D1C] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FDFBF7] transition-colors"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-6 flex items-center gap-2">
              <Package className="text-[#C85428]" /> Request Details
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#8E5022] uppercase">
                    Product Type
                  </p>
                  <p className="text-[#442D1C] font-medium text-lg">
                    {order.productType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8E5022] uppercase">
                    Quantity
                  </p>
                  <p className="text-[#442D1C]">{order.quantity} Units</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8E5022] uppercase">
                    Material
                  </p>
                  <p className="text-[#442D1C] capitalize">{order.material}</p>
                </div>
                {order.glaze && (
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Glaze / Finish
                    </p>
                    <p className="text-[#442D1C] capitalize">{order.glaze}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {order.dimensions && (
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase mb-1">
                      Dimensions
                    </p>
                    <div className="flex gap-4 text-sm text-[#442D1C] bg-[#FDFBF7] p-3 rounded-lg border border-[#EDD8B4]/50">
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
                {order.colorPreferences && (
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Color Preferences
                    </p>
                    <p className="text-[#442D1C] text-sm leading-relaxed">
                      {order.colorPreferences}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {order.specialRequirements && (
              <div className="mt-6 pt-6 border-t border-[#EDD8B4]/30">
                <p className="text-xs font-bold text-[#8E5022] uppercase mb-2">
                  Special Requirements
                </p>
                <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EDD8B4]/50 text-sm text-[#442D1C] leading-relaxed">
                  {order.specialRequirements}
                </div>
              </div>
            )}
          </div>

          {/* Reference Images */}
          {order.files && order.files.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
              <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-6 flex items-center gap-2">
                <Clipboard className="text-[#C85428]" /> Reference Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {order.files.map((file, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden aspect-square border border-[#EDD8B4]/50"
                  >
                    <img
                      src={file}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={file}
                      target="_blank"
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Action Panel */}
          <div
            className={`bg-white p-6 rounded-2xl border shadow-sm transition-all ${
              isEditing
                ? 'border-[#C85428] ring-1 ring-[#C85428]/20'
                : 'border-[#EDD8B4]'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl font-bold text-[#442D1C] flex items-center gap-2">
                <MessageSquare className="text-[#C85428]" /> Admin Actions
              </h3>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-[#8E5022] uppercase hover:underline"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                      Update Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:border-[#C85428] text-[#442D1C] font-medium appearance-none"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* PRICE INPUTS */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Estimated Price (₹)
                      </label>
                      <div className="relative">
                        <DollarSign
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E5022]"
                        />
                        <input
                          type="number"
                          value={estimatedPrice}
                          onChange={(e) => setEstimatedPrice(e.target.value)}
                          className="w-full pl-9 p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:border-[#C85428] text-[#442D1C] font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Final Price (₹)
                      </label>
                      <div className="relative">
                        <DollarSign
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E5022]"
                        />
                        <input
                          type="number"
                          value={actualPrice}
                          onChange={(e) => setActualPrice(e.target.value)}
                          className="w-full pl-9 p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:border-[#C85428] text-[#442D1C] font-medium"
                          placeholder="Set when completed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:border-[#C85428] text-[#442D1C]"
                    placeholder="Add notes about production, material costs, or customer communication..."
                  />
                </div>

                <div className="flex gap-4 pt-2 border-t border-[#EDD8B4]/30">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex-1 bg-[#442D1C] text-[#EDD8B4] py-3 rounded-xl font-bold hover:bg-[#2c1d12] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                  {status === 'QUOTED' && (
                    <button
                      onClick={handleSendQuote}
                      disabled={isUpdating || !estimatedPrice}
                      className="flex-1 bg-[#C85428] text-white py-3 rounded-xl font-bold hover:bg-[#a04320] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      <Send size={18} /> Send Quote Email
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {order.adminNotes ? (
                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EDD8B4]/50">
                    <p className="text-sm text-[#442D1C] whitespace-pre-wrap">
                      {order.adminNotes}
                    </p>
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-sm">
                    No notes added yet.
                  </p>
                )}

                <div className="flex gap-8 pt-4 border-t border-[#EDD8B4]/30">
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Estimated Price
                    </p>
                    <p className="text-xl font-bold text-[#442D1C]">
                      {order.estimatedPrice
                        ? `₹${order.estimatedPrice}`
                        : 'Not Set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#8E5022] uppercase">
                      Final Price
                    </p>
                    <p className="text-xl font-bold text-[#442D1C]">
                      {order.actualPrice ? `₹${order.actualPrice}` : 'Not Set'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4 flex items-center gap-2">
              <User className="text-[#C85428]" size={20} /> Customer
            </h3>

            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#EDD8B4]/30">
              <div className="w-10 h-10 bg-[#EDD8B4] rounded-full flex items-center justify-center font-bold text-[#442D1C]">
                {order.contactName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[#442D1C]">{order.contactName}</p>
                <p className="text-xs text-[#8E5022] uppercase">
                  {order.User ? 'Registered Member' : 'Guest'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`mailto:${order.contactEmail}`}
                className="flex items-center gap-3 text-sm text-stone-600 hover:text-[#C85428] transition-colors p-2 hover:bg-[#FDFBF7] rounded-lg"
              >
                <Mail size={16} /> {order.contactEmail}
              </a>
              {order.contactPhone && (
                <a
                  href={`tel:${order.contactPhone}`}
                  className="flex items-center gap-3 text-sm text-stone-600 hover:text-[#C85428] transition-colors p-2 hover:bg-[#FDFBF7] rounded-lg"
                >
                  <Phone size={16} /> {order.contactPhone}
                </a>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#442D1C] p-6 rounded-2xl text-[#EDD8B4] shadow-lg">
            <h3 className="font-serif text-lg font-bold mb-4">Quick Tools</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.id);
                  toast.success('Order ID copied');
                }}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm"
              >
                <Package size={16} /> Copy Order ID
              </button>
              <button
                onClick={() =>
                  window.open(
                    `mailto:${
                      order.contactEmail
                    }?subject=Re: Custom Order #${order.id.slice(0, 8)}`,
                  )
                }
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm"
              >
                <Mail size={16} /> Email Customer
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
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

              {order.deadline && (
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#442D1C] border-2 border-white"></div>
                  <p className="text-xs font-bold text-[#8E5022] uppercase">
                    Deadline
                  </p>
                  <p className="text-sm text-[#442D1C]">{order.deadline}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
