import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session'; // Ensure this path is correct for your project

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    // 1. Security Check: Must be logged in
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 2. Fetch Order
    const order = await prisma.order.findUnique({
      where: { id: id },
      select: { 
        id: true, 
        createdAt: true, 
        userId: true, 
        status: true // Useful for debugging
      } 
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Ownership Check: User can only check their OWN order freshness
    // (Optional: Allow if it's a guest order and they have the exact ID? 
    // For now, strict security is better)
    if (order.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error("Order Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}