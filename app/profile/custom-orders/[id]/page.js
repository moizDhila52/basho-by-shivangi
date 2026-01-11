'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  DollarSign,
  MessageSquare,
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
  Clipboard,
  MapPin,
  Edit2,
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
  const [actualPrice, setActualPrice] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState(''); // Timeline
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
      setActualPrice(data.actualPrice || '');
      setEstimatedCompletion(data.estimatedCompletion || '');
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
        estimatedCompletion,
        ...(estimatedPrice && { estimatedPrice: parseFloat(estimatedPrice) }),
        ...(actualPrice && { actualPrice: parseFloat(actualPrice) }),
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
        actualPrice: actualPrice
          ? parseFloat(actualPrice)
          : parseFloat(estimatedPrice),
        adminNotes: adminNotes || `Quote sent: ₹${estimatedPrice}`,
        estimatedCompletion,
      };

      const response = await fetch(`/api/custom-orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to send quote');

      toast.success(`Quote of ₹${estimatedPrice} sent`);
      setIsEditing(false);
      loadOrder();
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ... (Keep existing loading/auth check logic if needed, omitted for brevity but should be here) ...
  if (authLoading || loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8E5022]" />
      </div>
    );
  if (!user || user.role !== 'ADMIN')
    return <div className="p-8 text-center">Access Denied</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6 print:p-0 print:bg-white">
      {/* ======================= */}
      {/* 1. ADMIN DASHBOARD UI   */}
      {/* ======================= */}
      <div className="max-w-7xl mx-auto print:hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
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
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EDD8B4] text-[#442D1C]">
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[#8E5022] text-sm mt-1 flex items-center gap-2">
                <Calendar size={14} />
                Placed on {new Date(order.createdAt).toLocaleDateString()}
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
              <Printer size={16} /> Print Invoice
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Order Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
              <h3 className="font-serif text-xl font-bold text-[#442D1C] mb-6 flex items-center gap-2">
                <Package className="text-[#C85428]" /> Request Details
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
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
                      <div className="flex gap-3 text-sm text-[#442D1C] bg-[#FDFBF7] p-3 rounded-lg border border-[#EDD8B4]/50">
                        <span>H: {order.dimensions.height || '-'}</span>
                        <span>W: {order.dimensions.width || '-'}</span>
                        <span>D: {order.dimensions.depth || '-'}</span>
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
                    Cancel
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
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.replace('_', ' ')}
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
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none"
                        placeholder="e.g. 2 Weeks"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-2">
                        Estimated Price (₹)
                      </label>
                      <input
                        type="number"
                        value={estimatedPrice}
                        onChange={(e) => setEstimatedPrice(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none"
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
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none"
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
                      className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl outline-none"
                    />
                  </div>
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="w-full bg-[#442D1C] text-[#EDD8B4] py-3 rounded-xl font-bold hover:bg-[#2c1d12] transition-colors disabled:opacity-70"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4 bg-[#FDFBF7] p-4 rounded-xl border border-[#EDD8B4]/50">
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Est. Price
                      </p>
                      <p className="text-lg font-bold text-[#442D1C]">
                        {estimatedPrice ? `₹${estimatedPrice}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Final Price
                      </p>
                      <p className="text-lg font-bold text-[#442D1C]">
                        {actualPrice ? `₹${actualPrice}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#8E5022] uppercase">
                        Completion
                      </p>
                      <p className="text-[#442D1C]">
                        {estimatedCompletion || '-'}
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
          </div>

          {/* RIGHT: Customer Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#442D1C] mb-4 flex items-center gap-2">
                <User size={18} /> Customer
              </h3>
              <div className="mb-4">
                <p className="font-bold text-[#442D1C]">{order.contactName}</p>
                <a
                  href={`mailto:${order.contactEmail}`}
                  className="text-sm text-[#C85428] hover:underline block"
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

            {/* Reference Images */}
            {order.files && order.files.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-[#EDD8B4] shadow-sm">
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

      {/* ======================= */}
      {/* 2. PRINTABLE INVOICE    */}
      {/* ======================= */}
      <div className="hidden print:block max-w-[210mm] mx-auto bg-white p-8">
        {/* Header */}
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

        {/* Bill To */}
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

        {/* Line Items */}
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
                  Material:{' '}
                  <span className="font-medium text-[#442D1C] capitalize">
                    {order.material}
                  </span>
                </p>
                {order.glaze && <p>Finish: {order.glaze}</p>}
                <p>Quantity: {order.quantity}</p>
                <p className="mt-1 italic text-xs">
                  Est. Completion: {order.estimatedCompletion || 'TBD'}
                </p>
              </td>
              <td className="py-4 px-4 text-right align-top font-bold text-[#442D1C] text-lg">
                ₹{order.actualPrice || order.estimatedPrice || 0}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-stone-200">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-medium">₹{order.actualPrice || 0}</span>
            </div>
            <div className="flex justify-between py-4 text-xl font-bold text-[#442D1C]">
              <span>Total</span>
              <span>₹{order.actualPrice || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-stone-400 border-t border-stone-100 pt-8">
          <p className="mb-2">Thank you for supporting handcrafted artistry.</p>
          <p>Terms: Custom orders are non-refundable once production begins.</p>
        </div>
      </div>

      {/* Print Styling Fixes */}
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
