import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, name, phone, address } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Validation: Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 2. Hash Password
    const hashedPassword = await hashPassword(password);

    // 3. Create User & Address
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phone,
        role: "CUSTOMER",
        addresses: {
          create: {
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: true,
          },
        },
      },
    });

    // 4. Auto-Login
    await createSession({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
