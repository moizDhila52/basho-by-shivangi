import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req) {
  try {
    const { email, isSubscribed } = await req.json();
    const session = await getSession();

    // 1. Update User Profile if logged in
    if (session?.userId) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { isSubscribed },
      });
    }

    // 2. Manage the dedicated Subscriber List
    if (isSubscribed) {
      // Upsert: Create if new, update if exists
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: { isActive: true },
        create: { email, source: "checkout" },
      });
    } else {
      // Optional: Mark as inactive if they uncheck it explicitly
      // await prisma.newsletterSubscriber.update({ ... isActive: false })
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}