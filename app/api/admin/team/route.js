import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Fetch all Admins
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

// 2. POST: Add a New Admin (or Upgrade Existing User)
export async function POST(req) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Logic A: User exists -> Upgrade them to ADMIN
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" } // Grant access
      });
      return NextResponse.json({ success: true, user: updatedUser, type: 'UPDATED' });
    } else {
      // Logic B: New User -> Create as ADMIN
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          role: "ADMIN",
        }
      });
      return NextResponse.json({ success: true, user: newUser, type: 'CREATED' });
    }

  } catch (error) {
    console.error("Add Admin Error:", error);
    return NextResponse.json({ error: "Failed to add admin" }, { status: 500 });
  }
}

// 3. DELETE: Revoke Admin Access
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Downgrade to CUSTOMER (don't delete the account entirely)
    await prisma.user.update({
      where: { id },
      data: { role: "CUSTOMER" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 });
  }
}