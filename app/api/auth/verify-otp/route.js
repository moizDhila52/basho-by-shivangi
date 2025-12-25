import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // 2. Validate OTP
    // Check if OTP exists and matches
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check if OTP is expired
    const now = new Date();
    const expiryDate = new Date(user.otpExpiresAt);
    if (expiryDate <= now) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // 3. Clear OTP (Security best practice)
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpiresAt: null },
    });

    // 4. Create Session Cookie
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role || "CUSTOMER",
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
