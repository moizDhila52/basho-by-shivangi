import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const registrations = await prisma.workshopRegistration.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        // Must match the field name in 'WorkshopRegistration' model
        WorkshopSession: { 
          include: {
            // Must match the field name in 'WorkshopSession' model
            Workshop: {
              select: { title: true }
            }
          }
        }
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Registration Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}