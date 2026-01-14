import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCampaignEmail } from "@/lib/mailer"; // <--- IMPORT THIS

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id, isActive: true },
      include: {
        Testimonial: { where: { approved: true }, orderBy: { featured: "desc" } },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Extract newsletter flag
    const { sendNewsletter, ...updateData } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        shortDescription: updateData.shortDescription,
        type: updateData.type,
        location: updateData.location,
        address: updateData.address,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        image: updateData.image,
        gallery: updateData.gallery,
        status: updateData.status,
        featured: updateData.featured,
        isActive: updateData.isActive,
      },
    });

    // --- NEWSLETTER LOGIC ---
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
                    type: 'EVENT',
                    item: event,
                    customSubject: `Event Update: ${event.title}`,
                    customMessage: `We have some updates regarding ${event.title}. Check out the details.`
                });

                await prisma.newsletterCampaign.create({
                    data: {
                        subject: result.subject,
                        type: 'EVENT',
                        referenceId: event.id,
                        recipientCount: result.count,
                        status: 'SENT'
                    }
                });
            }
        } catch (mailError) {
            console.error("Failed to send event update newsletter:", mailError);
        }
    }
    // -------------------------

    return NextResponse.json({ success: true, data: event, message: "Event updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.event.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}