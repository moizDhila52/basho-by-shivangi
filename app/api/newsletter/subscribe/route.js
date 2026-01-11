import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNewsletterWelcomeEmail } from '@/lib/mailer';
import { getSession } from '@/lib/session';

export async function POST(req) {
  try {
    const body = await req.json();

    const { email, isSubscribed = true, source = 'footer' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      );
    }

    const session = await getSession();

    if (isSubscribed) {
      const subscriber = await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: {
          isActive: true,
        },
        create: {
          email,
          source: source,
          isActive: true,
        },
      });

      await prisma.user.updateMany({
        where: { email },
        data: { isSubscribed: true },
      });

      try {
        await sendNewsletterWelcomeEmail(email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    } else {
      await prisma.newsletterSubscriber
        .update({
          where: { email },
          data: { isActive: false },
        })
        .catch(() => {});

      await prisma.user.updateMany({
        where: { email },
        data: { isSubscribed: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: isSubscribed ? 'Subscribed successfully' : 'Unsubscribed',
    });
  } catch (error) {
    console.error('Newsletter Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
