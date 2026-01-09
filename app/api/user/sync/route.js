import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // 2. Address Logic: Prevent Duplicates & Enforce Limit
    if (address) {
      // A. Check if this EXACT address already exists
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: user.id,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
      });

      // B. If it does NOT exist, proceed to checks
      if (!existingAddress) {
        // C. Check Limit (Max 2)
        const addressCount = await prisma.address.count({
          where: { userId: user.id },
        });

        if (addressCount < 2) {
          await prisma.address.create({
            data: {
              // Ensure your schema auto-generates IDs, or use crypto.randomUUID() if strictly required
              userId: user.id,
              street: address.street,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              
              isDefault: addressCount === 0,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
