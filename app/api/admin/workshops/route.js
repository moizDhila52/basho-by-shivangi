import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper for Slug
const createSlug = (title) => {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Date.now().toString().slice(-4)
  );
};

export async function GET() {
  try {
    const workshops = await prisma.workshop.findMany({
      include: {
        WorkshopSession: {
          orderBy: { date: 'asc' },
          // REMOVED: where: { date: { gte: new Date() } }
          // Reason: Admin needs all sessions to calculate if it's completed
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate Status Dynamically
    const processedWorkshops = workshops.map((workshop) => {
      const now = new Date();
      const sessions = workshop.WorkshopSession || [];

      // Check if all sessions are in the past
      const isCompleted =
        sessions.length > 0 && sessions.every((s) => new Date(s.date) < now);

      return {
        ...workshop,
        // Override status for display purposes
        status: isCompleted ? 'COMPLETED' : workshop.status,
      };
    });

    return NextResponse.json(processedWorkshops);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Create Workshop AND Sessions atomically
    const workshop = await prisma.workshop.create({
      data: {
        title: body.title,
        slug: createSlug(body.title),
        description: body.description,
        price: parseFloat(body.price),
        image: body.image || '',
        gallery: body.image ? [body.image] : [],

        duration: body.duration,
        maxStudents: parseInt(body.maxStudents),
        location: body.location,
        language: body.language,
        level: body.level,

        instructorName: body.instructorName,
        instructorRole: body.instructorRole,
        instructorImage: body.instructorImage || '',

        status: 'ACTIVE',

        // Relation Magic: Create sessions
        WorkshopSession: {
          create: body.sessions.map((s) => ({
            date: new Date(s.date),
            time: s.time,
            spotsTotal: parseInt(body.maxStudents),
            spotsBooked: 0,
          })),
        },
      },
    });

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Workshop Create Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
