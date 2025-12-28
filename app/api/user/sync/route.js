import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure you have your prisma client export here

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, phone, address, gstNumber } = body;

    // 1. Upsert User (Create if new, Update if exists)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
        gstNumber,
      },
      create: {
        email,
        name,
        phone,
        gstNumber,
      },
    });

    // 2. If address provided, save it
    if (address) {
      await prisma.address.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: true,
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
