import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import { Download, Printer } from 'lucide-react';

// --- Client Component for Print Button ---
// We define this inline to keep it simple, or you can extract it
import InvoiceActions from './InvoiceActions';

export const metadata = {
  title: 'Invoice | Bashō',
};

export default async function InvoicePage({ params }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: { OrderItem: true },
  });

  // 🟢 NEW CHECK (Allows Admins):
  if (!order) {
    notFound();
  }
  
  // If user is NOT the owner AND NOT an admin, block them
  if (order.userId !== session.userId && session.role !== 'ADMIN') {
    notFound();
  }

  const address =
    typeof order.address === 'string'
      ? JSON.parse(order.address)
      : order.address || {};

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
        
        {/* --- Action Buttons (Hidden when printing) --- */}
       <div className="fixed bottom-10 right-10 z-50 print:hidden">
  <InvoiceActions />
</div>

        {/* --- Header --- */}
        <div className="flex justify-between items-start border-b border-stone-200 pb-8 mb-8">
          <div>
            <h1 className="font-serif text-4xl text-[#442D1C] mb-2">Bashō.</h1>
            <div className="text-sm text-stone-500 space-y-1">
              <p>123 Artisan Avenue</p>
              <p>Pottery District, Jaipur 302001</p>
              <p>India</p>
              <p>support@basho.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-stone-300 uppercase tracking-widest mb-4">Invoice</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-bold text-stone-600">Invoice #:</span> {order.orderNumber || order.id.slice(0,8).toUpperCase()}</p>
              <p><span className="font-bold text-stone-600">Date:</span> {formatDate(order.createdAt)}</p>
              <p><span className="font-bold text-stone-600">Status:</span> {order.paymentStatus || 'Paid'}</p>
            </div>
          </div>
        </div>

        {/* --- Addresses --- */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Bill To</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold text-[#442D1C] text-lg">{order.customerName || 'Customer'}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
              {order.customerGst && <p>GST: {order.customerGst}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Ship To</h3>
            <div className="text-sm space-y-1">
              <p>{address.street}</p>
              <p>{address.city}, {address.state}</p>
              <p>{address.pincode}</p>
              <p>{address.country || 'India'}</p>
            </div>
          </div>
        </div>

        {/* --- Items Table --- */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-stone-100 text-left">
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs w-1/2">Item Description</th>
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs text-center">Qty</th>
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs text-right">Price</th>
                <th className="pb-3 font-bold text-stone-600 uppercase text-xs text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-stone-600">
              {order.OrderItem.map((item) => (
                <tr key={item.id} className="border-b border-stone-50">
                  <td className="py-4">
                    <p className="font-medium text-stone-800">{item.productName}</p>
                    <p className="text-xs text-stone-400">SKU: {item.productSlug}</p>
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="py-4 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Totals --- */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Tax (GST)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t-2 border-stone-100 pt-3 flex justify-between items-center">
              <span className="font-serif text-xl font-bold text-[#442D1C]">Total</span>
              <span className="font-serif text-xl font-bold text-[#442D1C]">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="absolute bottom-12 left-12 right-12 border-t border-stone-100 pt-8 text-center text-xs text-stone-400">
          <p className="mb-2">Thank you for choosing Bashō. We hope you cherish your clay treasures.</p>
          <p>For any questions regarding this invoice, please contact support@basho.com</p>
        </div>
      </div>
    </div>
  );
}