import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendWorkshopConfirmationEmail } from '@/lib/mailer'; // We will create this next

export async function POST(req) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, registrationId } = body;

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Update Registration Status
    const updatedReg = await prisma.workshopRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
      },
      include: { WorkshopSession: { include: { Workshop: true } } }
    });

    // 3. Update Session Spots (Decrement available spots)
    await prisma.workshopSession.update({
      where: { id: updatedReg.sessionId },
      data: {
        spotsBooked: { increment: 1 }
      }
    });

    // 4. Send Confirmation Email
    try {
        await sendWorkshopConfirmationEmail(updatedReg);
    } catch (emailError) {
        console.error("Email failed:", emailError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}