import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPaymentSuccessEmail } from '@/lib/mailer';
import { triggerNotification } from '@/lib/socketTrigger';

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
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
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order' },
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

    // 2. Find the Pending Order in DB
    const existingOrder = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found in database' },
        { status: 404 },
      );
    }

    // 3. Update Order Status to CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
      },
      include: { OrderItem: true }, // Fetch items for the email
    }); // <--- CLOSED THE UPDATE FUNCTION HERE

    // 👇 NOTIFICATION BLOCK (Moved OUTSIDE the update function) 👇
    if (updatedOrder.userId) {
      // A. DB Record
      await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: 'Order Confirmed!',
          message:
            'We have received your payment. We will start preparing your clay treasures.',
          type: 'ORDER',
          link: `/profile/orders/${updatedOrder.id}`,
        },
      });

      // B. Real-time Socket
      await triggerNotification(updatedOrder.userId, 'notification', {
        title: 'Order Confirmed!',
        message: 'Payment successful.',
      });
    }
    // 👆 END NOTIFICATION BLOCK 👆

    // 4. Send Payment Success Email
    try {
      const emailItems = updatedOrder.OrderItem.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));

      await sendPaymentSuccessEmail(updatedOrder, emailItems);
      console.log('✅ Payment email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send payment email:', emailError);
    }

    // 5. Clear the User's Cart
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
      message: 'Payment verified and order confirmed',
      orderId: updatedOrder.id,
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed: ' + error.message },
      { status: 500 },
    );
  }
}
