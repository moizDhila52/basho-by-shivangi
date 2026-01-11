import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30"); // Default 30
    const skip = (page - 1) * limit;

    // 1. Build Where Clause
    let whereClause = { role: "CUSTOMER" };

    // Search Logic (Name or Email)
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tab Filter Logic
    if (tab === "new") {
      whereClause.createdAt = { gte: subDays(new Date(), 30) };
    } else if (tab === "buyers") {
      whereClause.Order = { some: {} };
    } else if (tab === "active") {
      whereClause.OR = [
         { lastLogin: { gte: subDays(new Date(), 7) } },
         { Order: { some: { createdAt: { gte: subDays(new Date(), 30) } } } }
      ];
    }

    // 2. Fetch Data with Pagination
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        include: {
          _count: { select: { Order: true } },
          Order: { select: { total: true } }, // Minimal data for calculation
          Address: { where: { isDefault: true }, take: 1 }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // 3. Transform for UI
    const formattedCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      image: c.image,
      createdAt: c.createdAt,
      lastLogin: c.lastLogin,
      orderCount: c._count.Order,
      totalSpent: c.Order.reduce((sum, o) => sum + (o.total || 0), 0),
      country: c.Address[0]?.country || "N/A",
      city: c.Address[0]?.city || "N/A"
    }));

    return NextResponse.json({
      data: formattedCustomers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Customers API Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}