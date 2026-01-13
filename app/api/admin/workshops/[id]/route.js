import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWorkshopUpdateEmail } from '@/lib/mailer'; // 👈 Import Mailer
import { triggerNotification } from '@/lib/socketTrigger'; // 👈 Import Socket

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

// PUT: Update Workshop (Handle Cancellations)
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Update the Workshop
    const workshop = await prisma.workshop.update({
      where: { id },
      data: { ...body },
    });

    // 2. 🔔 CHECK FOR CANCELLATION
    if (body.status === 'CANCELLED') {
      // Find everyone registered for ANY session of this workshop
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
        // A. Send Cancellation Email
        await sendWorkshopUpdateEmail(reg, 'CANCELLED');

        // B. Send In-App Notification (If they are a registered user)
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
