import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const instance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const session = await getSession(); // Get logged in user if any
    const body = await req.json();
    const { sessionId, customerName, customerEmail, customerPhone } = body;

    // --- NEW GUARD LOGIC: PREVENT DOUBLE BOOKING ---
    if (session?.userId) {
      const existingBooking = await prisma.workshopRegistration.findFirst({
        where: {
          userId: session.userId,
          sessionId: sessionId,
          paymentStatus: 'PAID', // Only block if they actually paid
        },
      });

      if (existingBooking) {
        return NextResponse.json(
          { error: 'You have already booked a spot for this session.' },
          { status: 400 },
        );
      }
    }
    // -----------------------------------------------

    // 1. Fetch Session & Workshop Details
    const workshopSession = await prisma.workshopSession.findUnique({
      where: { id: sessionId },
      include: { Workshop: true },
    });

    if (!workshopSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(workshopSession.Workshop.price * 100), // Amount in paise
      currency: 'INR',
      receipt: `ws_${sessionId.slice(0, 8)}`,
    };

    const order = await instance.orders.create(options);

    // 3. Create Pending Registration in DB
    const registration = await prisma.workshopRegistration.create({
      data: {
        sessionId,
        customerName,
        customerEmail,
        customerPhone,
        amountPaid: workshopSession.Workshop.price,
        razorpayOrderId: order.id,
        paymentStatus: 'PENDING',
        userId: session?.userId || null, // Link to user if logged in
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      registrationId: registration.id, // Send back for reference
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Workshop Checkout Error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
