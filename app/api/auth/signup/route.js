import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(req) {
  try {
    const { email, password, name, phone } = await req.json();

    // 1. Check Existing
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 2. Create User (No Address)
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phone,
        role: "CUSTOMER",
      },
    });

    // 3. Auto-Login
    await createSession({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });
    // console.log(userId + "  " + email + "  " + role + "  " + name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(userId + "  " + email + "  " + role + "  " + name);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
