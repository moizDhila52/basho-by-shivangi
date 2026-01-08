import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ wishlist: [] });
    }

    // Get wishlist items
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.userId },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            inStock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ wishlist: wishlistItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}
