// app/api/events/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit"))
      : 100;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page"))
      : 1;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (featured === "true") where.featured = true;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          Testimonial: {
            where: { approved: true, featured: true },
            take: 3,
          },
        },
        orderBy: [{ featured: "desc" }, { startDate: "asc" }],
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: events,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // TODO: Add authentication check for admin
    const body = await request.json();

    if (!body.title || !body.description || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const event = await prisma.event.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        shortDescription: body.shortDescription,
        type: body.type || "EXHIBITION",
        location: body.location,
        address: body.address,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        image: body.image || "/images/default-event.jpg",
        gallery: body.gallery || [],
        status: body.status || "UPCOMING",
        featured: body.featured || false,
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating event:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Event with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
