import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Group by category and count IDs
    const groupCounts = await prisma.galleryItem.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      where: {
        isActive: true, // Only count active items
      },
    });

    // 2. Calculate Total "All" count
    const total = groupCounts.reduce((acc, curr) => acc + curr._count.id, 0);

    // 3. Transform into a simple object: { PRODUCT: 5, WORKSHOP: 12 }
    const counts = groupCounts.reduce((acc, curr) => {
      acc[curr.category] = curr._count.id;
      return acc;
    }, {});

    return NextResponse.json({ total, counts });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ total: 0, counts: {} });
  }
}
