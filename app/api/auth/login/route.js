import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, uid, name, image, phone } = body;

    if (!email || !uid) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 },
      );
    }

    console.log('Attempting login for:', email);

    // 1. Upsert User
    // Logic: If found, update image/firebaseUid. If new, create with CUSTOMER role.
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        image: image || undefined,
        phone: phone || undefined, // <--- Update phone if provided
        firebaseUid: uid,
        // NEVER update role here, or an ADMIN logging in via Google becomes a CUSTOMER
      },
      create: {
        email,
        firebaseUid: uid,
        name: name || 'User',
        image: image || null,
        phone: phone || null, // <--- Save phone on creation
        role: 'CUSTOMER',
      },
    });

    // --- NEW: Update lastLogin for Analytics ---
    // This allows the "Recently Active" tab in Customer Management to work
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    // -------------------------------------------

    // 2. Create Server Session (Cookie)
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      image: user.image,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
