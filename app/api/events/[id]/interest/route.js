import { NextResponse } from "next/server";
// FIX: Import 'prisma' instead of 'db' based on your error message
import { prisma } from "@/lib/db"; 

export async function POST(req, { params }) {
  try {
    // Await params if using Next.js 15+, otherwise access directly
    const { id } = await params; 

    // FIX: Use 'prisma.event.update' instead of 'db.event.update'
    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: {
        interestedCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true, count: updatedEvent.interestedCount });
  } catch (error) {
    console.error("Error updating interest:", error);
    return NextResponse.json({ success: false, error: "Failed to update interest" }, { status: 500 });
  }
}