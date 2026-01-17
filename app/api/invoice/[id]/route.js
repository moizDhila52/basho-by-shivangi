import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { renderToStream } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/components/pdf/InvoiceTemplate';

export async function GET(request, { params }) {
  // Destructure params directly
  try {
    // Await params if using Next.js 15+, otherwise access directly
    const { id } = await params;

    const session = await getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'standard';

    // 1. Fetch Order
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        OrderItem: true,
        // User: true, // You generally don't need the full User object if order has customer details
      },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // 2. Fetch Store Settings
    const settings = await prisma.storeSettings.findFirst();

    // Security Check: UNCOMMENTED THE RETURN
    const isOwner = order.userId === session.userId;
    if (!isOwner && session.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 3. Generate PDF Stream
    const stream = await renderToStream(
      <InvoiceDocument order={order} type={type} settings={settings} />,
    );

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${
          order.orderNumber || id
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice Generation Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
