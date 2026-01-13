import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCampaignEmail } from "@/lib/mailer"; // <--- IMPORT THIS

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");

    const where = { isActive: true };
    if (status) where.status = status;
    if (type) where.type = type;
    if (featured === "true") where.featured = true;

    const events = await prisma.event.findMany({
      where,
      include: {
        Testimonial: { where: { approved: true }, take: 3 },
      },
      orderBy: [{ startDate: "asc" }],
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Extract newsletter flag
    const { sendNewsletter, ...eventData } = body;
    
    // Generate Slug
    const slug = eventData.slug || eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        slug,
        description: eventData.description,
        shortDescription: eventData.shortDescription,
        type: eventData.type,
        location: eventData.location,
        address: eventData.address,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        image: eventData.image,
        gallery: eventData.gallery || [],
        status: eventData.status,
        featured: eventData.featured,
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
                    customSubject: `You're Invited: ${event.title}`,
                    customMessage: event.shortDescription || event.description.substring(0, 150) + "..."
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
            console.error("Failed to send event newsletter:", mailError);
        }
    }
    // -------------------------

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}