import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 30;
    
    // New Params
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, most_orders, most_workshops
    const filter = searchParams.get('filter') || 'all'; // all, newsletter, buyers

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
      where.Order = { some: {} }; // Users who have at least one order
    }

    // 3. Sorting Logic
    let orderBy = { createdAt: 'desc' }; // Default

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

    // Fetch Data with Deep Relations
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: orderBy,
        include: {
          Address: {
            where: { isDefault: true },
            take: 1,
          },
          // Fetch Orders
          Order: {
            orderBy: { createdAt: 'desc' },
            include: {
              OrderItem: {
                include: {
                  Product: {
                    select: { name: true, images: true, slug: true }
                  }
                }
              }
            }
          },
          // Fetch Workshops
          WorkshopRegistration: {
            orderBy: { createdAt: 'desc' },
            include: {
              WorkshopSession: {
                include: {
                  Workshop: {
                    select: { title: true, image: true, slug: true }
                  }
                }
              }
            }
          },
          _count: {
            select: { Order: true, WorkshopRegistration: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform Data
    const formattedUsers = users.map((user) => {
      const totalSpent = user.Order.reduce((sum, order) => sum + (order.total || 0), 0);
      const primaryAddress = user.Address[0] || null;

      // Flatten Orders to get a list of purchased products
      const purchasedProducts = user.Order.flatMap(order => 
        order.OrderItem.map(item => ({
          id: item.id,
          name: item.productName || item.Product?.name,
          price: item.price,
          date: order.createdAt,
          image: item.productImage || item.Product?.images?.[0] || null,
          quantity: item.quantity
        }))
      );

      // Format Workshops
      const registeredWorkshops = user.WorkshopRegistration.map(reg => ({
        id: reg.id,
        title: reg.WorkshopSession?.Workshop?.title || "Unknown Workshop",
        date: reg.WorkshopSession?.date,
        amount: reg.amountPaid,
        image: reg.WorkshopSession?.Workshop?.image || null
      }));

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
        totalSpent: totalSpent,
        orderCount: user._count.Order,
        workshopCount: user._count.WorkshopRegistration,
        products: purchasedProducts,
        workshops: registeredWorkshops,
        address: primaryAddress ? {
          street: primaryAddress.street,
          city: primaryAddress.city,
          state: primaryAddress.state,
          country: primaryAddress.country,
          pincode: primaryAddress.pincode
        } : null,
      };
    });

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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}