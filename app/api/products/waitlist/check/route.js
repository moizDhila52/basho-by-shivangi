import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

// Add this to prevent Next.js from caching the result
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const session = await getSession();

    if (!session?.user?.email || !productId) {
      return NextResponse.json({ isSubscribed: false });
    }

    const entry = await prisma.productWaitlist.findUnique({
      where: {
        productId_email: {
          productId: productId,
          email: session.user.email,
        },
      },
    });

    return NextResponse.json({ isSubscribed: !!entry });
  } catch (error) {
    console.error('Waitlist check error:', error);
    return NextResponse.json({ isSubscribed: false }, { status: 500 });
  }
}
