import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth"; // Ensure this path is correct
import { createSession } from "@/lib/session"; // Ensure this path is correct

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

    // 2. Create User
    const hashedPassword = await hashPassword(password);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phone,
        role: "CUSTOMER",
        // Create an empty cart for the user immediately
        Cart: {
            create: {} 
        }
      },
    });

    // 3. Auto-Login
    await createSession({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });
    
    console.log(`User created: ${newUser.email} (${newUser.id})`);
    
    return NextResponse.json({ success: true });

  } catch (error) {
    // FIX: Log the actual error object, not undefined variables
    console.error("Signup Route Error:", error); 
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}