import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req) {
  try {
    let { email, otp } = await req.json();

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    
    // 2. Validate OTP
    // Check if OTP matches AND is not expired
    if (user.otp != otp) {
      return NextResponse.json({ error: "Wrong OTP!"}, { status: 400 });
    }
    if (Date(user.otpExpiresAt) <= Date.now()) {
      return NextResponse.json({ error: "OTP expired, try again!"}, { status: 400 })
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
      name: user.name,
      role: user.role,
    });
    
    return NextResponse.json({ success: true, role: user.role }, { status: 200 });

  }
  catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}