// app/api/events/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const event = await prisma.event.findUnique({
      where: {
        id,
        isActive: true,
      },
      include: {
        Testimonial: {
          where: { approved: true },
          orderBy: { featured: "desc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // TODO: Add authentication check for admin
    const { id } = params;
    const body = await request.json();

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        shortDescription: body.shortDescription,
        type: body.type,
        location: body.location,
        address: body.address,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        image: body.image,
        gallery: body.gallery,
        status: body.status,
        featured: body.featured,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // TODO: Add authentication check for admin
    const { id } = params;

    await prisma.event.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
