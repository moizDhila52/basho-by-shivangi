import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req) {
  try {
    const { productId, email } = await req.json();
    const session = await getSession();

    // Use session email if not provided manually
    const targetEmail = email || session?.user?.email;
    const userId = session?.userId || null;

    if (!productId || !targetEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Save to Waitlist
    await prisma.productWaitlist.create({
      data: {
        productId,
        email: targetEmail,
        userId: userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // If unique constraint fails (already subscribed), just return success to be polite
    if (error.code === 'P2002') return NextResponse.json({ success: true });
    
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}