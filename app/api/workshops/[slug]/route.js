import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const { slug } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { slug },
      include: {
        WorkshopSession: {
          where: {
            date: { gte: new Date() }, // Only future dates
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    return NextResponse.json(workshop);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}