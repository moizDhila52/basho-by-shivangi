import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendCampaignEmail } from '@/lib/mailer';

// Helper for Slug (Preserved from original code)
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

// --- UPDATED GET FUNCTION (With Auto-Cleanup & Detail Fetch) ---
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // --- 🧹 START: AUTO-CLEANUP LOGIC 🧹 ---
    // 1. Define cutoff time (1 hour ago)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // 2. Find expired "PENDING" registrations for this workshop
    // We need to find them first so we can restore the spot counts
    const expiredRegistrations = await prisma.workshopRegistration.findMany({
      where: {
        paymentStatus: 'PENDING',
        createdAt: { lt: oneHourAgo },
        WorkshopSession: {
          workshopId: id, // Only clean up for the current workshop
        },
      },
    });

    // 3. Restore spots and delete records
    if (expiredRegistrations.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const reg of expiredRegistrations) {
          // A. Free up the spot in the session
          await tx.workshopSession.update({
            where: { id: reg.sessionId },
            data: { spotsBooked: { decrement: 1 } },
          });

          // B. Delete the stale registration
          await tx.workshopRegistration.delete({
            where: { id: reg.id },
          });
        }
      });
      console.log(
        `Cleaned up ${expiredRegistrations.length} expired pending registrations.`,
      );
    }
    // --- 🧹 END CLEANUP LOGIC 🧹 ---

    // ... Existing code to fetch the workshop details ...
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

    if (!workshop) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// --- POST FUNCTION (Preserved from original code) ---
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
          prisma.user.findMany({
            where: { isSubscribed: true },
            select: { email: true },
          }),
          prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            select: { email: true },
          }),
        ]);

        const allEmails = [
          ...new Set([
            ...users.map((u) => u.email),
            ...guestSubscribers.map((s) => s.email),
          ]),
        ];

        if (allEmails.length > 0) {
          // 2. Send Campaign
          const result = await sendCampaignEmail(allEmails, {
            type: 'WORKSHOP',
            item: workshop,
            customSubject: `New Workshop: ${workshop.title}`,
            customMessage: `We are excited to announce a new ${workshop.level} level workshop on ${workshop.title}. Slots are limited!`,
          });

          // 3. Log History
          await prisma.newsletterCampaign.create({
            data: {
              subject: result.subject,
              type: 'WORKSHOP',
              referenceId: workshop.id,
              recipientCount: result.count,
              status: 'SENT',
            },
          });
        }
      } catch (mailError) {
        console.error('Failed to send workshop newsletter:', mailError);
      }
    }
    // ---------------------------------------------

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Workshop Create Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
