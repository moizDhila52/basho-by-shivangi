import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { sessionId } = await params;

    const session = await prisma.workshopSession.findUnique({
      where: { id: sessionId },
      include: {
        Workshop: true, // We need the Workshop title, price, location
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}