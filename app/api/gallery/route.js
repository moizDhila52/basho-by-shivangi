import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session"; // Your custom session handler

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getSession();
    const userId = session?.userId;

    // 1. Extract & Parse Params
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // 2. Build Where Clause
    const where = {
      isActive: true, // Only show active items
    };

    // Handle Enum Category
    if (category && category !== "all") {
      where.category = category; // Prisma will validate this against the Enum
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // 3. Build Sort
    let orderBy = {};
    if (sort === "popular") {
      orderBy = { likesCount: "desc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    // 4. Fetch Data
    const [items, totalCount] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        include: {
          // Optimization: Only fetch the like for THIS user
          likes: userId ? { where: { userId } } : false,
        },
      }),
      prisma.galleryItem.count({ where }),
    ]);

    // 5. Transform for Frontend
    const formattedItems = items.map((item) => ({
      ...item,
      // Convert relations to a simple boolean
      isLiked: userId ? item.likes.length > 0 : false,
      likes: undefined, // Cleanup response
    }));

    return NextResponse.json({
      items: formattedItems,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: skip + items.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Gallery API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Basic Validation
    if (!body.title || !body.image || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newItem = await prisma.galleryItem.create({
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        category: body.category,
        featured: body.featured || false,
        eventId: body.eventId || null,
      },
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error("Create Error:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
