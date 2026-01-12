import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { triggerNotification } from '@/lib/socketTrigger'; // 👈 Import Socket
import { sendCustomOrderStatusEmail } from '@/lib/mailer'; // 👈 Import Mailer

// GET: Get single custom order
export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id } = await params;

    const customOrder = await prisma.customOrder.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!customOrder) {
      return NextResponse.json(
        { error: 'Custom order not found' },
        { status: 404 },
      );
    }

    // Check if user has permission to view this order
    if (session.role !== 'ADMIN' && customOrder.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(customOrder);
  } catch (error) {
    console.error('Error fetching custom order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom order' },
      { status: 500 },
    );
  }
}

// PUT: Update custom order
export async function PUT(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Only admins can update orders
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // 1. Fetch Existing Order (To compare status)
    const existingOrder = await prisma.customOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = existingOrder.status;
    const newStatus = body.status;

    // 2. Update Database
    const customOrder = await prisma.customOrder.update({
      where: { id },
      data: {
        status: newStatus,
        adminNotes: body.adminNotes,
        estimatedPrice: body.estimatedPrice,
        actualPrice: body.actualPrice,
        estimatedCompletion: body.estimatedCompletion,
        paymentStatus: body.paymentStatus,
        paymentId: body.paymentId,
        updatedAt: new Date(),
      },
      // Include User so we can send email to them
      include: {
        User: true,
      },
    });

    // 3. 🔔 TRIGGER NOTIFICATIONS (If Status Changed)
    if (newStatus && newStatus !== oldStatus) {
      // A. Database Notification (Persistent)
      await prisma.notification.create({
        data: {
          userId: customOrder.userId,
          title: `Custom Request: ${newStatus.replace('_', ' ')}`,
          message: `Your custom order #${id.slice(
            0,
            8,
          )} status has been updated to ${newStatus}.`,
          type: 'CUSTOM_ORDER',
          link: `/profile/custom-orders/${id}`,
        },
      });

      // B. Socket Notification (Real-time Popup)
      await triggerNotification(customOrder.userId, 'notification', {
        title: `Custom Order Update`,
        message: `Status updated to ${newStatus.replace('_', ' ')}`,
      });

      // C. Send Email
      try {
        await sendCustomOrderStatusEmail(customOrder, newStatus);
        console.log(`✅ Custom Order Email sent for status: ${newStatus}`);
      } catch (emailError) {
        console.error('❌ Failed to send custom order email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      customOrder,
      message: 'Custom order updated successfully',
    });
  } catch (error) {
    console.error('Error updating custom order:', error);
    return NextResponse.json(
      { error: 'Failed to update custom order' },
      { status: 500 },
    );
  }
}
