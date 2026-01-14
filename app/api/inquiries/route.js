import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  sendInquiryAutoReply,
  sendAdminInquiryNotification,
} from '@/lib/mailer';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      service,
      teamSize,
      budget,
      timeline,
      message,
    } = body;

    // contactName, email, and message are always required
    if (!contactName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create record (Handling both Corporate and General Contact)
    const inquiry = await prisma.corporateInquiry.create({
      data: {
        companyName: companyName || 'Individual', // Individual if not corporate
        contactName,
        email,
        phone,
        companySize: teamSize,
        service: service || 'General Inquiry',
        interest: [service, budget, timeline].filter(Boolean),
        message,
        status: 'PENDING',
      },
    });

    // --- TRIGGER EMAILS ---
    // 1. Send Auto-reply to User
    await sendInquiryAutoReply(email, contactName);

    // 2. Send Notification to Admin
    await sendAdminInquiryNotification({
      contactName,
      email,
      service,
      companyName,
      message,
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('Inquiry Submission Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 },
    );
  }
}
