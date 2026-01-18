import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPaymentSuccessEmail } from '@/lib/mailer';
import {
  triggerNotification,
  broadcastStockUpdate,
  notifyAdminNewOrder, // 👈 Add this
} from '@/lib/socketTrigger';
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
      include: { OrderItem: true }, // We need items to check stock
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found in database' },
        { status: 404 },
      );
    }

    // 👇👇👇 INSERT THIS BLOCK HERE 👇👇👇
    // ------------------------------------------------------------
    // 🛑 IDEMPOTENCY CHECK: If already paid, return success immediately
    // ------------------------------------------------------------
    if (existingOrder.status === 'CONFIRMED' || existingOrder.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        orderId: existingOrder.id,
      });
    }
    // 👆👆👆 END INSERT 👆👆👆

    // ============================================================
    // 🔒 ATOMIC TRANSACTION: Stock Check & Update
    // ============================================================
    try {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // A. Loop through items to Check & Decrement Stock
        for (const item of existingOrder.OrderItem) {
          // Fetch latest stock from DB (Pass locking not supported in all Prisma versions, but atomic update is safe)
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product ${item.productName} not found`);
          }

          // B. THE RACE CONDITION CHECK 🏁
          if (product.stock < item.quantity) {
            throw new Error(`OOS: ${product.name}`); // Out of Stock Exception
          }

          // C. Decrement Stock
          const newStock = product.stock - item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: newStock,
              inStock: newStock > 0,
            },
          });

          // D. Broadcast New Stock Level to All Users 📡
          // We do this inside the loop but verify it outside (Note: cannot await socket inside transaction safely, usually fine to fire and forget)
          // We will fire the socket AFTER the transaction succeeds to be safe.
        }

        // E. Update Order Status
        return await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentId: razorpay_payment_id,
          },
          include: { OrderItem: true },
        });
      });

      // --- Transaction Succeeded: Logic below runs only if stock was secured ---

      // 3. 📡 Broadcast Stock Updates (Now that DB is updated)
      for (const item of existingOrder.OrderItem) {
        // Fetch the new stock to broadcast accurate number
        const p = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (p) await broadcastStockUpdate(p.id, p.stock);
      }

      // 4. Notifications
      if (updatedOrder.userId) {
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

        try {
  await triggerNotification(updatedOrder.userId, 'notification', {
    title: 'Order Confirmed!',
    message: 'Payment successful.',
  });
} catch (socketError) {
  console.error('Socket notification failed (non-critical):', socketError);
  // Don't throw - let payment succeed even if notification fails
}
      }

      await notifyAdminNewOrder({
        orderId: updatedOrder.id,
        amount: updatedOrder.total,
        customerName: updatedOrder.customerName || "Guest",
        productCount: updatedOrder.OrderItem.length
      });

      // 5. Send Email
      try {
        const emailItems = updatedOrder.OrderItem.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        }));
        await sendPaymentSuccessEmail(updatedOrder, emailItems);
      } catch (emailError) {
        console.error('❌ Failed to send payment email:', emailError);
      }

      // 6. Clear Cart
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
    } catch (err) {
      console.error('TRANSACTION FAILED:', err.message);

      // If error is "OOS", it means Race Condition hit!
      if (err.message.startsWith('OOS')) {
        // Mark order as FAILED or REFUND_NEEDED
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { status: 'CANCELLED', paymentStatus: 'REFUND_NEEDED' },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              'Some items went out of stock just now. Payment will be refunded.',
          },
          { status: 409 }, // 409 Conflict
        );
      }

      throw err; // Re-throw other errors
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed: ' + error.message },
      { status: 500 },
    );
  }
}
