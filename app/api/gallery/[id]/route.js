// app/api/gallery/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const galleryItem = await prisma.galleryItem.findUnique({
      where: { id, isActive: true },
      include: {
        Event: true,
      },
    });

    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: "Gallery item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: galleryItem,
    });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery item" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // TODO: Add authentication check for admin
    const { id } = params;
    const body = await request.json();

    const galleryItem = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        featured: body.featured,
        order: body.order,
        eventId: body.eventId,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: galleryItem,
      message: "Gallery item updated successfully",
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}
