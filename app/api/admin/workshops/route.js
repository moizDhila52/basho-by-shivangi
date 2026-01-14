import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendCampaignEmail } from '@/lib/mailer'; // <--- IMPORT THIS

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

    // Destructure sendNewsletter to keep it out of Prisma creation data
    const { sendNewsletter, ...workshopData } = body;

    // Create Workshop AND Sessions atomically
    const workshop = await prisma.workshop.create({
      data: {
        title: workshopData.title,
        slug: createSlug(workshopData.title),
        description: workshopData.description,
        price: parseFloat(workshopData.price),
        image: workshopData.image || '',
        gallery: workshopData.image ? [workshopData.image] : [],

        duration: workshopData.duration,
        maxStudents: parseInt(workshopData.maxStudents),
        location: workshopData.location,
        language: workshopData.language,
        level: workshopData.level,

        instructorName: workshopData.instructorName,
        instructorRole: workshopData.instructorRole,
        instructorImage: workshopData.instructorImage || '',

        status: 'ACTIVE',

        // Relation Magic: Create sessions
        WorkshopSession: {
          create: workshopData.sessions.map((s) => ({
            date: new Date(s.date),
            time: s.time,
            spotsTotal: parseInt(workshopData.maxStudents),
            spotsBooked: 0,
          })),
        },
      },
    });

    // --- NEW LOGIC: SEND NEWSLETTER IF CHECKED ---
    if (sendNewsletter) {
      try {
        // 1. Fetch Subscribers
        const [users, guestSubscribers] = await Promise.all([
          prisma.user.findMany({ where: { isSubscribed: true }, select: { email: true } }),
          prisma.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } })
        ]);

        const allEmails = [...new Set([
          ...users.map(u => u.email),
          ...guestSubscribers.map(s => s.email)
        ])];

        if (allEmails.length > 0) {
          // 2. Send Campaign
          const result = await sendCampaignEmail(allEmails, {
            type: 'WORKSHOP',
            item: workshop,
            customSubject: `New Workshop: ${workshop.title}`,
            customMessage: `We are excited to announce a new ${workshop.level} level workshop on ${workshop.title}. Slots are limited!`
          });

          // 3. Log History
          await prisma.newsletterCampaign.create({
            data: {
              subject: result.subject,
              type: 'WORKSHOP',
              referenceId: workshop.id,
              recipientCount: result.count,
              status: 'SENT'
            }
          });
        }
      } catch (mailError) {
        console.error("Failed to send workshop newsletter:", mailError);
      }
    }
    // ---------------------------------------------

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Workshop Create Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}