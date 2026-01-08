// app/api/address/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET: Fetch all saved addresses for the checkout page
export async function GET(req) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: { isDefault: 'desc' }, // Show default first
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST: Add new address (Checks the limit of 2)
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session?.userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // CONSTRAINT CHECK: Check how many addresses exist
    const count = await prisma.address.count({
      where: { userId: session.userId },
    });

    if (count >= 2) {
      return NextResponse.json(
        { error: 'Address limit reached (Max 2)' },
        { status: 400 },
      );
    }

    const data = await req.json();
    const address = await prisma.address.create({
      data: { ...data, userId: session.userId },
    });
    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

// PUT: Edit existing address
export async function PUT(req) {
  try {
    const session = await getSession();
    if (!session?.userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 },
      );
    }

    const address = await prisma.address.update({
      where: { id: id },
      data: updates,
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE: Remove an address
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session?.userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Get the 'id' from the URL (e.g., /api/address?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 },
      );
    }

    // 2. Delete the address from the database
    // Optional: Add `userId: session.userId` to 'where' to ensure users can only delete their own data
    await prisma.address.delete({
      where: {
        id: id,
      },
    });

    // 3. Return success
    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete Address Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete address. It might not exist.' },
      { status: 500 },
    );
  }
}
