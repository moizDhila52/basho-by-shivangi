import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInquiryReplyEmail } from '@/lib/mailer';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const updatedInquiry = await prisma.corporateInquiry.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// NEW POST Handler for replying
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { message } = await req.json();

    const inquiry = await prisma.corporateInquiry.findUnique({ where: { id } });
    if (!inquiry)
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });

    // 1. Send the email
    await sendInquiryReplyEmail(inquiry.email, inquiry.contactName, message);

    // 2. Update DB: Set status to CONTACTED and append to notes
    const updated = await prisma.corporateInquiry.update({
      where: { id },
      data: {
        status: 'CONTACTED',
        notes: inquiry.notes
          ? `${inquiry.notes}\n\n--- REPLY SENT ---\n${message}`
          : `--- REPLY SENT ---\n${message}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Reply Error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.corporateInquiry.delete({ where: { id } });
    return NextResponse.json({ message: 'Inquiry deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
