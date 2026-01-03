// app/api/gallery/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const eventId = searchParams.get("eventId");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit"))
      : 50;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page"))
      : 1;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
    };

    if (category) where.category = category;
    if (featured === "true") where.featured = true;
    if (eventId) where.eventId = eventId;

    const [gallery, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        include: {
          Event: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { featured: "desc" },
          { order: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.galleryItem.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: gallery,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // TODO: Add authentication check for admin
    const body = await request.json();

    if (!body.title || !body.image || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.galleryItem.aggregate({
      _max: { order: true },
    });

    const galleryItem = await prisma.galleryItem.create({
      data: {
        title: body.title,
        description: body.description || null,
        image: body.image,
        category: body.category,
        featured: body.featured || false,
        order: body.order || (maxOrder._max.order || 0) + 1,
        eventId: body.eventId || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: galleryItem,
      message: "Gallery item created successfully",
    });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gallery item" },
      { status: 500 }
    );
  }
}
