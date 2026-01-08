import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Initialize Razorpay
const instance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  // Kept for backward compatibility, though Checkout uses /api/orders/create now
  try {
    const { amount } = await req.json();
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: 'receipt_' + Math.random().toString(36).substring(7),
    };
    const order = await instance.orders.create(options);
    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 },
      );
    }

    // 2. Find the Order First (Fix for the crash)
    // Since razorpayOrderId isn't @unique in schema, we use findFirst
    const existingOrder = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 },
      );
    }

    // 3. Update the Order using its ID
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
      },
    });

    // 4. Clear Cart Logic
    if (updatedOrder.userId) {
      const cart = await prisma.cart.findUnique({
        where: { userId: updatedOrder.userId },
      });
      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      orderId: updatedOrder.id,
    });
  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed: ' + error.message },
      { status: 500 },
    );
  }
}
