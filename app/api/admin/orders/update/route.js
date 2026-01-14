import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/mailer';
import { triggerNotification } from '@/lib/socketTrigger';

export async function PUT(req) {
  try {
    const body = await req.json();
    // Map 'status' from body to 'newStatus' variable for clarity
    const { id, status: newStatus, ...otherData } = body;

    if (!id || !newStatus) {
      return NextResponse.json(
        { error: 'Order ID and Status are required' },
        { status: 400 },
      );
    }

    // 1. Fetch existing order to check old status
    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = existingOrder.status;

    // 2. Update Database with Date Logic & Includes
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        ...otherData,
        // Optional: If status is DELIVERED, set deliveredAt
        ...(newStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        // Optional: If status is SHIPPED, set shippedAt
        ...(newStatus === 'SHIPPED' ? { shippedAt: new Date() } : {}),
      },
      // 👇 IMPORTANT: Include User Image so frontend updates immediately
      include: {
        OrderItem: true,
        User: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // 3. Logic: If status changed, Notify!
    if (newStatus !== oldStatus) {
      // Only attempt notifications if there is a User ID linked (Not for Guest Guest with no ID)
      if (updatedOrder.userId) {
        try {
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
        } catch (notifError) {
          console.error('Notification trigger failed:', notifError);
          // Don't block the response if notification fails
        }
      }

      // C. Send Email (Works for Guests too via email address)
      try {
        await sendOrderStatusEmail(updatedOrder, newStatus);
      } catch (e) {
        console.error('Email sending failed:', e);
      }
    }

    // 4. Return success structure expected by frontend
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 },
    );
  }
}
