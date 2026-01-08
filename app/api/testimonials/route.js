// app/api/testimonials/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const productId = searchParams.get("productId");
    const workshopId = searchParams.get("workshopId");
    const eventId = searchParams.get("eventId");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit"))
      : 20;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page"))
      : 1;
    const skip = (page - 1) * limit;

    const where = {
      approved: true,
      isActive: true,
    };

    if (featured === "true") where.featured = true;
    if (productId) where.productId = productId;
    if (workshopId) where.workshopId = workshopId;
    if (eventId) where.eventId = eventId;

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        include: {
          Product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
          Workshop: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
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
          { rating: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.testimonial.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: testimonials,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.content) {
      return NextResponse.json(
        { success: false, error: "Name and content are required" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: body.customerName,
        customerRole: body.customerRole,
        content: body.content,
        rating: body.rating || 5,
        image: body.image,
        videoUrl: body.videoUrl,
        source: body.source || "Website",
        productId: body.productId,
        workshopId: body.workshopId,
        eventId: body.eventId,
        approved: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: "Testimonial submitted for review",
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
