import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/mailer'; // Import the email function

export async function PUT(req) {
  try {
    const body = await req.json();
    // Destructure status as newStatus to avoid confusion
    const { id, status: newStatus, ...otherData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    // 1. Fetch the EXISTING order first to get the old status
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = existingOrder.status; // <--- Define oldStatus here

    // 2. Perform the Update
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        ...otherData, // Update other fields if any
      },
    });

    // 3. Send Email ONLY if the status has changed
    if (newStatus && newStatus !== oldStatus) {
      try {
        await sendOrderStatusEmail(updatedOrder, newStatus);
        console.log(
          `✅ Status email sent for Order #${updatedOrder.orderNumber || id}`,
        );
      } catch (emailError) {
        console.error('❌ Failed to send status email:', emailError);
        // Don't fail the request if email fails, just log it
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 },
    );
  }
}
