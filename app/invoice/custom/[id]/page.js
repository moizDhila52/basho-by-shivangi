'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Printer, AlertCircle } from 'lucide-react';

export default function CustomOrderInvoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/custom-orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
      </div>
    );
  }

  // Allow access if Paid OR manually Approved
  const isApproved = [
    'APPROVED',
    'IN_PROGRESS',
    'COMPLETED',
    'SHIPPED',
    'DELIVERED',
  ].includes(order?.status);
  const isPaid = order?.paymentStatus === 'PAID';

  if (!order || (!isPaid && !isApproved)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-stone-100 p-8 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="w-12 h-12 text-[#C85428] mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#442D1C] mb-2">
            Invoice Unavailable
          </h2>
          <p className="text-stone-500">
            This invoice cannot be generated yet. The order must be confirmed or
            paid.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8 print:p-0 print:bg-white flex justify-center items-start">
      {/* Invoice Container - A4 Ratio approx */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-xl print:shadow-none p-12 relative text-stone-800">
        {/* --- Floating Print Button --- */}
        <div className="fixed bottom-10 right-10 z-50 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#442D1C] text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-[#2c1d12] transition-all hover:scale-105"
          >
            <Printer size={18} /> Print Invoice
          </button>
        </div>

        {/* --- Header --- */}
        <div className="flex justify-between items-start border-b border-stone-200 pb-8 mb-8">
          <div>
            <h1 className="font-serif text-4xl text-[#442D1C] mb-2">Bashō.</h1>
            <div className="text-sm text-stone-500 space-y-1">
              <p>Studio Bashō</p>
              <p>Surat, Gujarat</p>
              <p>India</p>
              <p>hello@bashoceramics.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-stone-300 uppercase tracking-widest mb-4">
              Invoice
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-bold text-stone-600">Invoice #:</span>{' '}
                {order.id.slice(0, 8).toUpperCase()}
              </p>
              <p>
                <span className="font-bold text-stone-600">Date:</span>{' '}
                {formatDate(order.updatedAt)}
              </p>
              <p>
                <span className="font-bold text-stone-600">Status:</span>{' '}
                {isPaid ? 'Paid' : order.status}
              </p>
            </div>
          </div>
        </div>

        {/* --- Addresses --- */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Bill To
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-bold text-[#442D1C] text-lg">
                {order.contactName}
              </p>
              <p>{order.contactEmail}</p>
              <p>{order.contactPhone}</p>
            </div>
          </div>
          <div>
            {/* Since custom orders are pickup, we show Pickup Info instead of Ship To */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Collection Method
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-bold text-[#442D1C] text-lg">Studio Pickup</p>
              <p>Please present this invoice</p>
              <p>when collecting your item.</p>
            </div>
          </div>
        </div>

        {/* --- Items Table --- */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-stone-100 text-left">
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs w-1/2">
                  Item Description
                </th>
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs text-center">
                  Qty
                </th>
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs text-right">
                  Price
                </th>
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="text-stone-600">
              <tr className="border-b border-stone-50">
                <td className="py-4">
                  <p className="font-medium text-stone-800">
                    Custom Commission: {order.productType}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Material: {order.material} | Finish:{' '}
                    {order.glaze || 'Standard'}
                  </p>
                  <p className="text-xs text-stone-400">
                    Est. Completion: {order.estimatedCompletion || 'TBD'}
                  </p>
                </td>
                <td className="py-4 text-center">{order.quantity}</td>
                <td className="py-4 text-right">₹{order.actualPrice}</td>
                <td className="py-4 text-right font-medium">
                  ₹{order.actualPrice}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- Totals --- */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>₹{order.actualPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Tax (Inclusive)</span>
              <span>₹0.00</span>
            </div>
            <div className="border-t-2 border-stone-100 pt-3 flex justify-between items-center">
              <span className="font-serif text-xl font-bold text-[#442D1C]">
                Total
              </span>
              <span className="font-serif text-xl font-bold text-[#442D1C]">
                ₹{order.actualPrice}
              </span>
            </div>
          </div>
        </div>

        {/* --- Payment Info (if exists) --- */}
        {order.paymentId && (
          <div className="mb-12 border border-stone-200 bg-stone-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-stone-400 uppercase mb-1">
              Payment Confirmation
            </p>
            <p className="text-sm text-stone-600">
              Paid via Razorpay • Transaction ID:{' '}
              <span className="font-mono text-stone-800">
                {order.paymentId}
              </span>
            </p>
          </div>
        )}

        {/* --- Footer --- */}
        <div className="absolute bottom-12 left-12 right-12 border-t border-stone-100 pt-8 text-center text-xs text-stone-400">
          <p className="mb-2">
            Thank you for choosing Bashō. We hope you cherish your custom
            creation.
          </p>
          <p>
            For any questions regarding this invoice, please contact
            hello@bashoceramics.com
          </p>
        </div>
      </div>
    </div>
  );
}
