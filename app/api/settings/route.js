import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch settings or fallback to defaults
    const settings = await prisma.storeSettings.findFirst() || {
      shippingBaseRate: 50,
      shippingPerKgRate: 40,
      freeShippingThreshold: 5000,
      gstPercent: 12
    };
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}