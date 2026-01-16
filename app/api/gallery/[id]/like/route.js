import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

export async function POST(request, context) {
  try {
    // 1. Safe Param Extraction (Next.js 15 vs 14 compatibility)
    // We await context.params to handle the case where it is a Promise
    const params = await context.params;
    const galleryItemId = params?.id;

    // Debug Log: Check your terminal to see if this prints the ID
    console.log("DEBUG: Like Request for ID:", galleryItemId);

    if (!galleryItemId) {
      return NextResponse.json(
        { error: "Invalid ID: Parameter missing" },
        { status: 400 }
      );
    }

    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check if item exists in Database
    const item = await prisma.galleryItem.findUnique({
      where: { id: galleryItemId },
    });

    if (!item) {
      console.error(`DEBUG: Item ${galleryItemId} not found in DB`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // 3. Check if already liked by this user
    const existingLike = await prisma.galleryLike.findUnique({
      where: {
        userId_galleryItemId: {
          userId: session.userId,
          galleryItemId: galleryItemId,
        },
      },
    });

    if (existingLike) {
      // --- UNLIKE ---
      await prisma.$transaction([
        prisma.galleryLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.galleryItem.update({
          where: { id: galleryItemId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ success: true, liked: false });
    } else {
      // --- LIKE ---
      await prisma.$transaction([
        prisma.galleryLike.create({
          data: {
            id: uuidv4(),
            userId: session.userId,
            galleryItemId: galleryItemId,
          },
        }),
        prisma.galleryItem.update({
          where: { id: galleryItemId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error("Gallery Like API Critical Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
