import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req) {
  try {
    // Check if you have a 'WorkshopBooking' or 'Booking' table in your schema.
    // I am assuming 'WorkshopBooking' based on standard naming. 
    // If your table is named differently (e.g., 'Booking'), please rename it below.
    
    const registrations = await prisma.workshopBooking.findMany({
      take: 10, // Only get the latest 10
      orderBy: { createdAt: 'desc' },
      include: {
        session: {
          include: {
            workshop: {
              select: { title: true }
            }
          }
        }
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Registration Fetch Error:", error);
    // Return empty array so the app doesn't crash if table doesn't exist yet
    return NextResponse.json([]); 
  }
}