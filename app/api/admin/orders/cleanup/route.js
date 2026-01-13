import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    // 1. Calculate time 30 mins ago
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    // 2. Find expired orders
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: thirtyMinsAgo }
      },
      include: { OrderItem: true }
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json({ message: 'No expired orders found' });
    }

    // 3. Loop through and restore stock
    // We use a transaction to ensure safety
    await prisma.$transaction(async (tx) => {
      for (const order of expiredOrders) {
        // A. Mark Order as CANCELLED
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', adminNotes: 'Auto-cancelled due to timeout' }
        });

        // B. Restore Stock for each item
        for (const item of order.OrderItem) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: expiredOrders.length, 
      message: `Cancelled ${expiredOrders.length} expired orders and restored stock.` 
    });

  } catch (error) {
    console.error("Cleanup Error:", error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}