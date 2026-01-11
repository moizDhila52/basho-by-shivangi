import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Make sure this path matches your project (lib/db or lib/prisma)
import { getSession } from '@/lib/session';
import Razorpay from 'razorpay';

// Use environment variables for safety
const razorpay = new Razorpay({
  key_id:
    process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await req.json();

    // 1. Find the Custom Order
    const customOrder = await prisma.customOrder.findUnique({
      where: { id: orderId },
    });

    if (!customOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Validate Price
    if (!customOrder.actualPrice) {
      return NextResponse.json(
        { error: 'Price not set for this order' },
        { status: 400 },
      );
    }

    // 3. Create Razorpay Order
    const amountInPaise = Math.round(customOrder.actualPrice * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      notes: {
        type: 'CUSTOM_ORDER', // Distinguishes it from regular orders
        orderId: orderId,
      },
    });

    // 4. Save Razorpay ID to CustomOrder Table
    await prisma.customOrder.update({
      where: { id: orderId },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure public key is sent
      amount: amountInPaise,
      currency: 'INR',
      orderId: rzpOrder.id,
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json(
      { error: 'Checkout initialization failed' },
      { status: 500 },
    );
  }
}
