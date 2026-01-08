import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // REPLACE THIS WITH YOUR EXACT LOGIN EMAIL
  const TARGET_EMAIL = "moizdhilawala5@gmail.com";

  try {
    const user = await prisma.user.update({
      where: { email: TARGET_EMAIL },
      data: { role: "ADMIN" }, // Force role update
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.email} role is now: ${user.role}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
