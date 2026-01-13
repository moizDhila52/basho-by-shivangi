import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/mailer'; // 👈 Import this
import { triggerNotification } from '@/lib/socketTrigger'; // 👈 Import this

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 2. 🎉 Send Welcome Email
    try {
      await sendWelcomeEmail(user.email, user.name || 'Pottery Lover');
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    // 3. 🔔 Send Welcome Notification (In-App)
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

    // Trigger socket (in case they login immediately after)
    await triggerNotification(user.id, 'notification', {
      title: 'Welcome to Bashō!',
      message: 'We are delighted to have you.',
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
