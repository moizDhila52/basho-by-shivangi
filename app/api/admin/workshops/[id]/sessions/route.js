import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST: Add a new session to a workshop
export async function POST(req, { params }) {
  try {
    const { id } = await params; // Workshop ID
    const body = await req.json();
    const { date, time, spots } = body;

    const session = await prisma.workshopSession.create({
      data: {
        workshopId: id,
        date: new Date(date),
        time: time,
        spotsTotal: parseInt(spots),
        spotsBooked: 0,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Add Session Error:", error);
    return NextResponse.json({ error: 'Failed to add session' }, { status: 500 });
  }
}

// DELETE: Remove a specific session
export async function DELETE(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    await prisma.workshopSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ message: 'Session deleted' });
  } catch (error) {
    console.error("Delete Session Error:", error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}