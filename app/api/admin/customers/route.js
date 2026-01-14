import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 30;

    const sort = searchParams.get('sort') || 'newest';
    const filter = searchParams.get('filter') || 'all';

    const skip = (page - 1) * limit;

    let where = {};

    // 1. Search Logic
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 2. Filter Logic
    if (filter === 'newsletter') {
      where.isSubscribed = true;
    } else if (filter === 'buyers') {
      // Basic check for linked orders (approximate for filtering)
      where.Order = { some: {} };
    }

    // 3. Sorting Logic
    let orderBy = { createdAt: 'desc' };

    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'most_orders':
        orderBy = { Order: { _count: 'desc' } };
        break;
      case 'most_workshops':
        orderBy = { WorkshopRegistration: { _count: 'desc' } };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // 4. Fetch Users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: orderBy,
        include: {
          Address: { where: { isDefault: true }, take: 1 },
          WorkshopRegistration: {
            orderBy: { createdAt: 'desc' },
            include: {
              WorkshopSession: {
                include: {
                  Workshop: {
                    select: { title: true, image: true, slug: true },
                  },
                },
              },
            },
          },
          _count: { select: { WorkshopRegistration: true } }, // We'll manually count orders
        },
      }),
      prisma.user.count({ where }),
    ]);

    // 5. ENHANCED LOGIC: Fetch Orders by Email OR User ID
    // We process users one by one to get their complete order history (Linked + Guest)
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        // A. Find ALL orders for this person (Linked via ID OR matching Email)
        const allOrders = await prisma.order.findMany({
          where: {
            OR: [
              { userId: user.id },
              { customerEmail: user.email }, // Matches Guest Orders
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            OrderItem: {
              include: {
                Product: { select: { name: true, images: true, slug: true } },
              },
            },
          },
        });

        const totalSpent = allOrders.reduce((sum, order) => {
          if (order.status === 'DELIVERED') {
            return sum + (order.total || 0);
          }
          return sum;
        }, 0);

        const orderCount = allOrders.length;

        // C. Flatten Products from ALL orders
        const purchasedProducts = allOrders.flatMap((order) =>
          order.OrderItem.map((item) => ({
            id: item.id,
            name: item.productName || item.Product?.name,
            price: item.price,
            date: order.createdAt,
            image: item.productImage || item.Product?.images?.[0] || null,
            quantity: item.quantity,
          })),
        );

        // D. Format Workshops (Standard)
        const registeredWorkshops = user.WorkshopRegistration.map((reg) => ({
          id: reg.id,
          title: reg.WorkshopSession?.Workshop?.title || 'Unknown Workshop',
          date: reg.WorkshopSession?.date,
          amount: reg.amountPaid,
          image: reg.WorkshopSession?.Workshop?.image || null,
        }));

        const primaryAddress = user.Address[0] || null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isSubscribed: user.isSubscribed,
          totalSpent: totalSpent, // Now correct!
          orderCount: orderCount, // Now correct!
          workshopCount: user._count.WorkshopRegistration,
          products: purchasedProducts,
          workshops: registeredWorkshops,
          address: primaryAddress
            ? {
                street: primaryAddress.street,
                city: primaryAddress.city,
                state: primaryAddress.state,
                country: primaryAddress.country,
                pincode: primaryAddress.pincode,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      data: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
