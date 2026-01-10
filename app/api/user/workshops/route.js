import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    
    // If not logged in, return unauthorized or empty array
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registrations = await prisma.workshopRegistration.findMany({
      where: {
        userId: session.userId,
        paymentStatus: 'PAID', // Only show confirmed bookings
      },
      include: {
        WorkshopSession: {
          include: {
            Workshop: true, // Get workshop details (title, location, image)
          },
        },
      },
      orderBy: {
        WorkshopSession: {
          date: 'desc', // Show most recent/upcoming first
        },
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching user workshops:', error);
    return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 });
  }
}