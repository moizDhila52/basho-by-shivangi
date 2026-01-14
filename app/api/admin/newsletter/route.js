import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCampaignEmail } from '@/lib/mailer';

// GET: Fetch Selection Data & History
export async function GET() {
  try {
    const [products, workshops, events, history] = await Promise.all([
      // Fetch products
      prisma.product.findMany({ 
        select: { id: true, name: true, slug: true, images: true, price: true, description: true },
        orderBy: { createdAt: 'desc' }
      }),
      
      // FIX IS HERE: Changed 'date' to 'createdAt'
      prisma.workshop.findMany({ 
        select: { id: true, title: true, slug: true, image: true, instructorName: true, location: true },
        orderBy: { createdAt: 'desc' } // <--- This matches your schema now
      }),
      
      // Fetch events
      prisma.event.findMany({ 
        select: { id: true, title: true, slug: true, image: true, startDate: true, description: true },
        orderBy: { startDate: 'desc' }
      }),
      
      prisma.newsletterCampaign.findMany({ 
        orderBy: { sentAt: 'desc' } 
      })
    ]);

    return NextResponse.json({ products, workshops, events, history });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST: Send Newsletter
export async function POST(req) {
  try {
    const body = await req.json();
    const { type, selectedItem, customSubject, customMessage } = body;

    // 1. Fetch Subscribers
    const [users, guestSubscribers] = await Promise.all([
      prisma.user.findMany({ where: { isSubscribed: true }, select: { email: true } }),
      prisma.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } })
    ]);

    // Merge and deduplicate emails
    const allEmails = [...new Set([
      ...users.map(u => u.email),
      ...guestSubscribers.map(s => s.email)
    ])];

    if (allEmails.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 });
    }

    // 2. Send Emails
    const result = await sendCampaignEmail(allEmails, {
      type,
      item: selectedItem,
      customSubject,
      customMessage
    });

    // 3. Save to History
    await prisma.newsletterCampaign.create({
      data: {
        subject: result.subject || customSubject || "Newsletter",
        type,
        referenceId: selectedItem.id,
        recipientCount: result.count,
        status: 'SENT'
      }
    });

    return NextResponse.json({ success: true, count: result.count });

  } catch (error) {
    console.error('Newsletter Campaign Error:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}