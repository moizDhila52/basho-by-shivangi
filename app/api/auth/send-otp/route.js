import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOTP } from "@/lib/mailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // 1. SECURITY CHECK: Does this user exist?
    const user = await prisma.user.findUnique({ where: { email } });

    // If no user found, DO NOT send OTP. Force them to Sign Up.
    if (!user) {
      return NextResponse.json(
        { error: "No account found. Please Sign Up first." },
        { status: 404 }
      );
    }

    // 2. Generate & Store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt: expiresAt },
    });

    await sendOTP(email, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
