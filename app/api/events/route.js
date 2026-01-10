import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");

    const where = { isActive: true };
    if (status) where.status = status;
    if (type) where.type = type;
    if (featured === "true") where.featured = true;

    const events = await prisma.event.findMany({
      where,
      include: {
        Testimonial: { where: { approved: true }, take: 3 },
      },
      orderBy: [{ startDate: "asc" }],
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Generate Slug
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const event = await prisma.event.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        shortDescription: body.shortDescription,
        type: body.type,
        location: body.location,
        address: body.address,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        image: body.image,
        gallery: body.gallery || [],
        status: body.status,
        featured: body.featured,
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}