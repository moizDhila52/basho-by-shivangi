import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { orderId, razorpayOrderId } = await req.json();

    // 1. Fetch payments for this Razorpay Order ID
    const payments = await razorpay.orders.fetchPayments(razorpayOrderId);

    // 2. Check if any payment was 'captured' (successful)
    const successfulPayment = payments.items.find(p => p.status === 'captured');

    if (successfulPayment) {
      // 3. If found, force update database to CONFIRMED
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'CONFIRMED',
          paymentId: successfulPayment.id,
          paymentStatus: 'PAID'
        }
      });
      return NextResponse.json({ success: true, status: 'CONFIRMED', order: updatedOrder });
    } else {
      return NextResponse.json({ success: false, message: 'No successful payment found at Razorpay' });
    }
  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}