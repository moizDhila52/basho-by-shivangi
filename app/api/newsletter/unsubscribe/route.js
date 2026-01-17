import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendUnsubscribeConfirmationEmail } from '@/lib/mailer';

export async function POST(req) {
  try {
    // 1. Parse Request
    let email;
    try {
      const body = await req.json();
      email = body.email;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 2. Perform Database Updates & Check for Existence
    // We capture the result to see if any records were actually touched
    const result = await prisma.$transaction(async (tx) => {
      // A. Update Newsletter Table
      const newsletterUpdate = await tx.newsletterSubscriber.updateMany({
        where: { email },
        data: { isActive: false }, 
      });

      // B. Update User Table
      const userUpdate = await tx.user.updateMany({
        where: { email },
        data: { isSubscribed: false },
      });

      // Return counts to verify existence
      return { 
        newsletterCount: newsletterUpdate.count, 
        userCount: userUpdate.count 
      };
    });

    // 3. Logic Check: Did we find the email?
    // If both counts are 0, the email simply doesn't exist in your system.
    if (result.newsletterCount === 0 && result.userCount === 0) {
      return NextResponse.json(
        { error: 'No active subscription found for this email address.' },
        { status: 404 }
      );
    }

    // 4. Send Confirmation Email (Non-blocking)
    try {
      await sendUnsubscribeConfirmationEmail(email);
    } catch (mailError) {
      console.error('Failed to send unsubscribe confirmation:', mailError);
      // We do not fail the request here because the DB update was successful
    }

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed.',
    });

  } catch (error) {
    console.error('Unsubscribe Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}