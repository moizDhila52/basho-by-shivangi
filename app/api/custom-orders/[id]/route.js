import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET: Get single custom order
export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const customOrder = await prisma.customOrder.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!customOrder) {
      return NextResponse.json(
        { error: "Custom order not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this order
    if (session.role !== "ADMIN" && customOrder.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(customOrder);
  } catch (error) {
    console.error("Error fetching custom order:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom order" },
      { status: 500 }
    );
  }
}

// PUT: Update custom order (for status updates, quotes, etc.)
export async function PUT(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only admins can update orders
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const customOrder = await prisma.customOrder.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      customOrder,
      message: "Custom order updated successfully",
    });
  } catch (error) {
    console.error("Error updating custom order:", error);
    return NextResponse.json(
      { error: "Failed to update custom order" },
      { status: 500 }
    );
  }
}
