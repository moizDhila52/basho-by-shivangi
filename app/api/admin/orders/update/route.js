import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/mailer';
import { triggerNotification } from '@/lib/socketTrigger'; // <--- IMPORT THIS

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status: newStatus, ...otherData } = body;

    if (!id)
      return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const oldStatus = existingOrder.status;

    // 1. Update Database
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: newStatus, ...otherData },
    });

    // 2. Logic: If status changed, Notify!
    if (newStatus && newStatus !== oldStatus) {
      // A. Create Persistent Notification in DB
      await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: `Order Updated: ${newStatus}`,
          message: `Your order #${
            updatedOrder.orderNumber || id.slice(-8)
          } is now ${newStatus}.`,
          type: 'ORDER',
          link: `/profile/orders/${updatedOrder.id}`,
        },
      });

      // B. Trigger Real-time Socket
      await triggerNotification(updatedOrder.userId, 'notification', {
        title: `Order ${newStatus}`,
        message: `Your order is ${newStatus}.`,
        link: `/profile/orders/${updatedOrder.id}`,
      });

      // C. Send Email (Existing logic)
      try {
        await sendOrderStatusEmail(updatedOrder, newStatus);
      } catch (e) {
        console.error(e);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
