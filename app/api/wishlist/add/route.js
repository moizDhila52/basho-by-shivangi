import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    // Get session instead of Firebase token
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: session.userId,
        productId: productId,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        wishlistItem: existing,
        message: "Already in wishlist",
      });
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        id: uuidv4(),
        userId: session.userId,
        productId: productId,
      },
    });

    return NextResponse.json({
      success: true,
      wishlistItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}
