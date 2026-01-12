import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/mailer'; // 👈 Import Mailer
import { triggerNotification } from '@/lib/socketTrigger'; // 👈 Import Socket Trigger

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, phone, address, gstNumber } = body;

    // 1. Check if user exists BEFORE upserting
    // We do this to know if we should send the "Welcome" email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const isNewUser = !existingUser;

    // 2. Upsert User (Create if new, Update if exists)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
        gstNumber,
      },
      create: {
        email,
        name,
        phone,
        gstNumber,
        // Create empty cart for new Google users
        Cart: {
          create: {},
        },
      },
    });

    // 3. 🎉 NEW USER EVENTS
    if (isNewUser) {
      try {
        console.log(`🎉 New Google User: ${email}`);

        // A. Send Welcome Email
        await sendWelcomeEmail(user.email, user.name || 'Pottery Lover');

        // B. Create DB Notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Welcome to Bashō!',
            message:
              'We are delighted to have you. Explore our collection or book a workshop.',
            type: 'SYSTEM',
            link: '/profile',
          },
        });

        // C. Trigger Socket Notification
        await triggerNotification(user.id, 'notification', {
          title: 'Welcome to Bashō!',
          message: 'We are delighted to have you.',
        });
      } catch (eventError) {
        console.error('Failed to trigger new user events:', eventError);
        // Don't fail the request, just log it
      }
    }

    // 4. Address Logic: Prevent Duplicates & Enforce Limit
    if (address) {
      // A. Check if this EXACT address already exists
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: user.id,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
      });

      // B. If it does NOT exist, proceed to checks
      if (!existingAddress) {
        // C. Check Limit (Max 2)
        const addressCount = await prisma.address.count({
          where: { userId: user.id },
        });

        if (addressCount < 2) {
          await prisma.address.create({
            data: {
              userId: user.id,
              street: address.street,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              isDefault: addressCount === 0,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
