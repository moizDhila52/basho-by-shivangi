import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const { registrationId, newSessionId } = await req.json();

    const registration = await prisma.workshopRegistration.findUnique({
      where: { id: registrationId },
      include: { WorkshopSession: true },
    });

    if (!registration)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 👇 1. CHECK: Allow Only Once
    if (registration.status === 'RESCHEDULED') {
      return NextResponse.json(
        { error: 'You have already rescheduled this session once.' },
        { status: 400 },
      );
    }

    // 2. Validate 48-Hour Rule
    const sessionDate = new Date(registration.WorkshopSession.date);
    const hoursDifference = (sessionDate - new Date()) / (1000 * 60 * 60);

    if (hoursDifference < 48) {
      return NextResponse.json(
        { error: 'Rescheduling closed (48h rule)' },
        { status: 400 },
      );
    }

    // 3. Check Capacity
    const newSession = await prisma.workshopSession.findUnique({
      where: { id: newSessionId },
    });
    if (newSession.spotsBooked >= newSession.spotsTotal) {
      return NextResponse.json(
        { error: 'Selected session is full' },
        { status: 400 },
      );
    }

    // 4. Perform Swap
    await prisma.$transaction([
      prisma.workshopSession.update({
        where: { id: registration.sessionId },
        data: { spotsBooked: { decrement: 1 } },
      }),
      prisma.workshopSession.update({
        where: { id: newSessionId },
        data: { spotsBooked: { increment: 1 } },
      }),
      prisma.workshopRegistration.update({
        where: { id: registrationId },
        data: {
          sessionId: newSessionId,
          status: 'RESCHEDULED', // Mark as rescheduled so they can't do it again
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Reschedule failed' }, { status: 500 });
  }
}
