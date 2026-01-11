import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import LabelActions from './LabelActions';

export default async function ShippingLabelPage({ params }) {
  const session = await getSession();
  // Ensure only admins can access this
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { OrderItem: true },
  });

  if (!order) {
    notFound();
  }

  const address =
    typeof order.address === 'string'
      ? JSON.parse(order.address)
      : order.address || {};

  // Calculate approximate weight (mock logic: 0.5kg per item)
  const totalWeight = order.OrderItem.reduce(
    (acc, item) => acc + item.quantity * 0.5,
    0,
  );

  // Use the Order Number or ID for the barcode value
  const barcodeValue = order.orderNumber || order.id;

  return (
    <div className="min-h-screen bg-stone-100 p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-hidden">
      {/* GLOBAL PRINT FIX STYLES */}
      <style>{`
        /* 1. Force the Printer Page Size to 4x6 Inches (Label Size) */
        @page {
          size: 100mm 150mm; 
          margin: 0;
        }

        @media print {
          /* Hide scrollbars and margins */
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }

          /* Hide Admin UI elements */
          body * {
            visibility: hidden;
          }
          aside, nav, header {
            display: none !important;
          }

          /* Show ONLY the label */
          #shipping-label, #shipping-label * {
            visibility: visible;
          }

          /* Force the label to fill the print area exactly */
          #shipping-label {
            position: fixed;
            left: 0;
            top: 0;
            width: 100mm !important;
            height: 150mm !important;
            margin: 0;
            padding: 1.5rem; /* Keep internal padding */
            border: none;
            box-shadow: none;
          }

          /* Ensure graphics/barcodes print clearly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Print Button (Floating) */}
      <div className="fixed bottom-10 right-10 z-50 print:hidden">
        <LabelActions />
      </div>

      {/* Label Container - 100mm x 150mm */}
      <div
        id="shipping-label"
        className="bg-white w-[100mm] h-[150mm] shadow-xl print:shadow-none border-2 border-black p-6 relative flex flex-col justify-between box-border mx-auto my-auto"
      >
        {/* Header / From Address */}
        <div className="border-b-2 border-black pb-4">
          <h1 className="font-bold text-2xl uppercase tracking-wider mb-2">
            Bashō.
          </h1>
          <p className="text-xs uppercase font-bold text-stone-500 mb-1">
            FROM:
          </p>
          <div className="text-sm font-medium leading-tight">
            <p>123 Artisan Avenue</p>
            <p>Pottery District</p>
            <p>Jaipur, RJ 302001</p>
            <p>India</p>
          </div>
        </div>

        {/* To Address (Big) */}
        <div className="flex-1 py-6">
          <p className="text-sm uppercase font-bold text-stone-500 mb-2">
            SHIP TO:
          </p>
          <div className="text-lg font-bold uppercase leading-snug">
            <p className="text-xl mb-1">{order.customerName}</p>
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state}
            </p>
            <p className="text-2xl mt-2">{address.pincode}</p>
            <p>{address.country || 'INDIA'}</p>
          </div>
          <div className="mt-4 text-sm font-bold">
            Ph: {order.customerPhone}
          </div>
        </div>

        {/* Footer Details */}
        <div className="border-t-2 border-black pt-2 mt-auto">
          {/* REAL Barcode Image */}
          <div className="flex flex-col items-center justify-center mb-1">
            <img
              src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcodeValue}&scale=2&height=8&includetext`}
              alt="Order Barcode"
              className="w-full max-h-12 object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold border-t border-dashed border-black pt-1">
            <div>
              <span className="text-stone-500 block text-[8px] uppercase tracking-wider">
                WEIGHT
              </span>
              {totalWeight.toFixed(1)} KG
            </div>
            <div className="text-right">
              <span className="text-stone-500 block text-[8px] uppercase tracking-wider">
                DATE
              </span>
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
