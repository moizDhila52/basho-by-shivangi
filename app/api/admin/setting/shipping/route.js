import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Fetch current settings
export async function GET() {
  try {
    let settings = await prisma.storeSettings.findFirst();

    // Create default if missing
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          shippingBaseRate: 50.0, // Default Base
          shippingPerKgRate: 40.0, // Default Extra
          gstPercent: 12.0,
          gstin: '',
          address: '',
          freeShippingThreshold: 0, // Legacy/Unused
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 },
    );
  }
}

// POST: Update settings
export async function POST(req) {
  try {
    const body = await req.json();

    // 👇 Destructure using the EXACT names from Frontend state
    const { shippingBaseRate, shippingPerKgRate, gstPercent, gstin, address } =
      body;

    const existing = await prisma.storeSettings.findFirst();

    const settings = await prisma.storeSettings.upsert({
      where: { id: existing?.id || 'new_settings' },
      update: {
        shippingBaseRate: parseFloat(shippingBaseRate),
        shippingPerKgRate: parseFloat(shippingPerKgRate),
        gstPercent: parseFloat(gstPercent),
        gstin,
        address,
      },
      create: {
        shippingBaseRate: parseFloat(shippingBaseRate),
        shippingPerKgRate: parseFloat(shippingPerKgRate),
        gstPercent: parseFloat(gstPercent),
        gstin,
        address,
        freeShippingThreshold: 0, // Default if required by schema
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 },
    );
  }
}
