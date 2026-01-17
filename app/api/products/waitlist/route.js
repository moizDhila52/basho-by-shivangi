import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import crypto from 'crypto'; // Import crypto

export async function POST(req) {
  try {
    const body = await req.json();
    const { productId, email } = body;
    const session = await getSession();

    const targetEmail = email || session?.user?.email;
    const userId = session?.user?.id || session?.userId;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      );
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Email is required. Please login.' },
        { status: 400 },
      );
    }

    // Save to Waitlist using upsert
    await prisma.productWaitlist.upsert({
      where: {
        productId_email: {
          productId,
          email: targetEmail,
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(), // Manually generate the ID here
        productId,
        email: targetEmail,
        userId: userId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waitlist Error:', error);

    if (error.code === 'P2002') return NextResponse.json({ success: true });

    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 },
    );
  }
}
