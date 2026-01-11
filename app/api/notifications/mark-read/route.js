import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update ALL unread notifications for this user to read
    await prisma.notification.updateMany({
      where: {
        userId: session.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}