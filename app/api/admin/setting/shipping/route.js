import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch current settings
export async function GET() {
  try {
    // Try to find the first settings record
    let settings = await prisma.storeSettings.findFirst();

    // If none exists, create a default one
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          shippingRate: 150,
          freeShippingThreshold: 5000,
          gstPercent: 12,
          gstin: "",
          address: "",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST: Update settings
export async function POST(req) {
  try {
    const body = await req.json();
    const { shippingRate, freeShippingThreshold, gstPercent, gstin, address } =
      body;

    // Find the existing record to update
    const existing = await prisma.storeSettings.findFirst();

    const settings = await prisma.storeSettings.upsert({
      where: { id: existing?.id || "new" }, // Use existing ID or force create if empty
      update: {
        shippingRate: parseFloat(shippingRate),
        freeShippingThreshold: parseFloat(freeShippingThreshold),
        gstPercent: parseFloat(gstPercent),
        gstin,
        address,
      },
      create: {
        shippingRate: parseFloat(shippingRate),
        freeShippingThreshold: parseFloat(freeShippingThreshold),
        gstPercent: parseFloat(gstPercent),
        gstin,
        address,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
