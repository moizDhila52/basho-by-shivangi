import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();

    const { items, address, userEmail, customerName, customerGst, paymentId } =
      body;

    if (!items || items.length === 0) {
      return new NextResponse('No items in checkout', { status: 400 });
    }

    const total = items.reduce((sum, item) => sum + Number(item.price), 0);

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,

        customerName: customerName,
        customerEmail: userEmail,

        customerGst: customerGst || null,

        address: address,
        total: total,
        status: paymentId ? 'PROCESSING' : 'PENDING',
        paymentId: paymentId || null,

        items: {
          create: items.map((item) => ({
            product: { connect: { id: item.id } },
            quantity: item.quantity || 1,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.log('[CHECKOUT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
