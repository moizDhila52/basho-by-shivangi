import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session'; // 👈 Import Session
import { sendWorkshopConfirmationEmail } from '@/lib/mailer'; // 👈 Import Mailer
import { triggerNotification } from '@/lib/socketTrigger'; // 👈 Import Socket

export async function POST(req) {
  try {
    const sessionAuth = await getSession(); // Check if user is logged in
    const body = await req.json();
    const { sessionId, customerName, customerEmail, amount } = body;

    // 1. Transaction to ensure no overbooking
    const result = await prisma.$transaction(async (tx) => {
      // A. Get current session state (Include Workshop for Email Title)
      const session = await tx.workshopSession.findUnique({
        where: { id: sessionId },
        include: { Workshop: true },
      });

      if (!session) throw new Error('Session not found');

      // B. Check Availability
      if (session.spotsBooked >= session.spotsTotal) {
        throw new Error('Sold Out');
      }

      // C. Create Registration Record
      const registration = await tx.workshopRegistration.create({
        data: {
          sessionId,
          // Link to user account if they are logged in
          userId: sessionAuth?.userId || null,
          customerName,
          customerEmail,
          amountPaid: parseFloat(amount),
          paymentStatus: 'paid',
        },
        // Include details needed for the Email
        include: {
          WorkshopSession: {
            include: { Workshop: true },
          },
        },
      });

      // D. Update Slots (Increment booked count)
      await tx.workshopSession.update({
        where: { id: sessionId },
        data: { spotsBooked: { increment: 1 } },
      });

      return registration;
    });

    // 2. 🔔 TRIGGER NOTIFICATIONS (Post-Transaction)
    try {
      // A. Send Email (To everyone)
      await sendWorkshopConfirmationEmail(result);

      // B. In-App Notification (Only for logged-in users)
      if (sessionAuth?.userId) {
        await prisma.notification.create({
          data: {
            userId: sessionAuth.userId,
            title: 'Booking Confirmed',
            message: `Your seat for "${result.WorkshopSession.Workshop.title}" is secured. See you there!`,
            type: 'WORKSHOP',
            link: '/profile/workshops',
          },
        });

        await triggerNotification(sessionAuth.userId, 'notification', {
          title: 'Workshop Booked!',
          message: 'See you at the studio.',
        });
      }
    } catch (notifyError) {
      console.error('Workshop Notification Failed:', notifyError);
      // We do not throw error here, because the booking was successful.
    }

    return NextResponse.json({ success: true, registration: result });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json(
      {
        error:
          error.message === 'Sold Out'
            ? 'This session is fully booked.'
            : 'Booking failed.',
      },
      { status: 400 },
    );
  }
}
