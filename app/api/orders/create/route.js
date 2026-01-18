import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    // 1. Extract customerName here 👇
    const { items, address, userEmail, userId, customerName } = body;

     console.log('DEBUG - Received userId:', userId);
    console.log('DEBUG - Received userEmail:', userEmail);

     // 🔴 FIX 2: Find user by email if userId not valid
    let dbUserId = userId;
    
    // If no userId provided, try to find user by email
    if (!dbUserId && userEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (existingUser) {
        dbUserId = existingUser.id;
        console.log('DEBUG - Found user by email:', dbUserId);
      }
    }
    
    // If userId is Firebase UID (not a UUID), find by firebaseUid
    if (dbUserId && dbUserId.length < 28 && !dbUserId.includes('-')) {
      const firebaseUser = await prisma.user.findUnique({
        where: { firebaseUid: dbUserId },
      });
      if (firebaseUser) {
        dbUserId = firebaseUser.id;
        console.log('DEBUG - Converted Firebase UID to DB ID:', dbUserId);
      }
    }
    
    console.log('DEBUG - Final dbUserId for order:', dbUserId);

    const settings = (await prisma.storeSettings.findFirst()) || {
      shippingBaseRate: 50,
      shippingPerKgRate: 40,
      freeShippingThreshold: 5000,
      gstPercent: 12,
    };

    let subtotal = 0;
    let totalWeight = 0;

    const dbItems = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
        });
        if (!product) throw new Error(`Product ${item.id} not found`);

        // 👇 NEW: PRE-PAYMENT STOCK CHECK
        if (product.stock < item.quantity) {
          throw new Error(
            `Sorry, "${product.name}" is out of stock (Available: ${product.stock})`,
          );
        }

        const lineTotal = product.price * item.quantity;
        const lineWeight = (product.weight || 0.5) * item.quantity;

        subtotal += lineTotal;
        totalWeight += lineWeight;

        return {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.images[0] || '',
          quantity: item.quantity,
          price: product.price,
        };
      }),
    );

    let shippingCost = 0;
    if (subtotal >= settings.freeShippingThreshold) {
      shippingCost = 0;
    } else {
      if (totalWeight <= 1) {
        shippingCost = settings.shippingBaseRate;
      } else {
        const extraWeight = Math.ceil(totalWeight - 1);
        shippingCost =
          settings.shippingBaseRate + extraWeight * settings.shippingPerKgRate;
      }
    }

    const tax = subtotal * (settings.gstPercent / 100);
    const totalAmount = subtotal + tax + shippingCost;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
    });

    const newOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
         ...(dbUserId && {
          User: { connect: { id: dbUserId } },
        }),
        customerEmail: userEmail,
        customerName: customerName,
        customerGst: body.customerGst || null,
        address: address,
        subtotal: subtotal,
        tax: tax,
        shippingCost: shippingCost,
        total: totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
        OrderItem: {
          create: dbItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({
      orderId: newOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Order Creation Error:', error);
    // Return 409 Conflict if stock issue, otherwise 500
    const status = error.message.includes('out of stock') ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
