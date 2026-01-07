import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

// GET: Fetch custom orders (with user check)
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    // If user is not admin, only show their own orders
    const where =
      session.role === "ADMIN"
        ? { ...(status && { status }) }
        : {
            userId: session.userId,
            ...(status && { status }),
          };

    const customOrders = await prisma.customOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(customOrders);
  } catch (error) {
    console.error("Error fetching custom orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom orders" },
      { status: 500 }
    );
  }
}

// POST: Create a new custom order
export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      productType,
      quantity = 1,
      material,
      glaze,
      dimensions,
      colorPreferences,
      specialRequirements,
      deadline,
      budgetRange,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      files = [],
    } = body;

    // Validate required fields
    if (!productType || !material || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const customOrder = await prisma.customOrder.create({
      data: {
        id: uuidv4(),
        userId: session.userId,
        productType,
        quantity,
        material,
        glaze,
        dimensions,
        colorPreferences,
        specialRequirements,
        deadline,
        budgetRange,
        contactName,
        contactEmail,
        contactPhone,
        notes,
        files,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      customOrder,
      message: "Custom order submitted successfully",
    });
  } catch (error) {
    console.error("Error creating custom order:", error);
    return NextResponse.json(
      { error: "Failed to create custom order" },
      { status: 500 }
    );
  }
}
