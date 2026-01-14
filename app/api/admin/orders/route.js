import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all orders with standard relation
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
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

    // 2. Identify "Guest" orders that might match a registered user by email
    const guestEmails = orders
      .filter((o) => !o.User && o.customerEmail) // No linked User, but has email
      .map((o) => o.customerEmail);

    // 3. Fetch user images for those emails
    if (guestEmails.length > 0) {
      const matchingUsers = await prisma.user.findMany({
        where: {
          email: { in: guestEmails },
        },
        select: {
          email: true,
          image: true,
        },
      });

      // Create a quick lookup map: email -> image
      const emailToImageMap = {};
      matchingUsers.forEach((u) => {
        if (u.email && u.image) {
          emailToImageMap[u.email] = u.image;
        }
      });

      // 4. Manually attach the image to the order object
      orders.forEach((order) => {
        if (!order.User && order.customerEmail && emailToImageMap[order.customerEmail]) {
          // We "fake" the User relation so the frontend works automatically
          order.User = {
            image: emailToImageMap[order.customerEmail],
          };
        }
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}