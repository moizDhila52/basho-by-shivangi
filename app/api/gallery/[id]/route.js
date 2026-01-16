import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session"; // Your session helper

// --- UPDATE ITEM (PUT) ---
export async function PUT(request, props) {
  const params = await props.params;
  try {
    const session = await getSession();
    // In real world, verify User is ADMIN here
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await request.json();

    const updatedItem = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        category: body.category,
        featured: body.featured,
        eventId: body.eventId || null,
        // Don't update likesCount here usually
      },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// --- DELETE ITEM (DELETE) ---
export async function DELETE(request, props) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    await prisma.galleryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
