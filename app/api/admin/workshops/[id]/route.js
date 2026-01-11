import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Fetch single workshop with sessions AND registrations
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        WorkshopSession: {
          orderBy: { date: 'asc' },
          include: {
            WorkshopRegistration: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!workshop)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Calculate Status Dynamically
    const now = new Date();
    const sessions = workshop.WorkshopSession || [];
    const isCompleted =
      sessions.length > 0 && sessions.every((s) => new Date(s.date) < now);

    const workshopWithStatus = {
      ...workshop,
      status: isCompleted ? 'COMPLETED' : workshop.status,
    };

    return NextResponse.json(workshopWithStatus);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.workshop.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
