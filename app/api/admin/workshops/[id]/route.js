import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWorkshopUpdateEmail, sendCampaignEmail } from '@/lib/mailer'; // 👈 Import sendCampaignEmail
import { triggerNotification } from '@/lib/socketTrigger'; 

// GET: Fetch single workshop
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

// PUT: Update Workshop
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // --- IMPORTANT: Extract sendNewsletter flag ---
    const { sendNewsletter, ...updateData } = body;

    // 1. Update the Workshop
    const workshop = await prisma.workshop.update({
      where: { id },
      data: { ...updateData },
    });

    // 2. 🔔 CHECK FOR CANCELLATION (Specific Attendees)
    if (updateData.status === 'CANCELLED') {
      const registrations = await prisma.workshopRegistration.findMany({
        where: {
          WorkshopSession: {
            workshopId: id,
          },
        },
        include: {
          WorkshopSession: {
            include: { Workshop: true },
          },
        },
      });

      console.log(
        `⚠️ Workshop Cancelled. Notifying ${registrations.length} attendees...`,
      );

      for (const reg of registrations) {
        await sendWorkshopUpdateEmail(reg, 'CANCELLED');

        if (reg.userId) {
          await prisma.notification.create({
            data: {
              userId: reg.userId,
              title: 'Workshop Cancelled',
              message: `The workshop "${workshop.title}" has been cancelled. Please check your email for refund details.`,
              type: 'WORKSHOP',
              link: '/profile/workshops',
            },
          });

          await triggerNotification(reg.userId, 'notification', {
            title: 'Workshop Cancelled',
            message: `Important update regarding ${workshop.title}`,
          });
        }
      }
    }

    // 3. --- NEW LOGIC: SEND NEWSLETTER TO ALL SUBSCRIBERS (If checked) ---
    if (sendNewsletter) {
      try {
        const [users, guestSubscribers] = await Promise.all([
          prisma.user.findMany({ where: { isSubscribed: true }, select: { email: true } }),
          prisma.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } })
        ]);

        const allEmails = [...new Set([
          ...users.map(u => u.email),
          ...guestSubscribers.map(s => s.email)
        ])];

        if (allEmails.length > 0) {
          const result = await sendCampaignEmail(allEmails, {
            type: 'WORKSHOP',
            item: workshop,
            customSubject: `Update: ${workshop.title}`,
            customMessage: `We have updates regarding our ${workshop.title} workshop. Check out the latest details.`
          });

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
        console.error("Failed to send workshop update newsletter:", mailError);
      }
    }
    // -------------------------------------------------------------------

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE: Remove workshop
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.workshop.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}