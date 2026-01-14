// app/api/admin/inquiries/reply/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendInquiryReplyEmail } from "@/lib/mailer";

export async function POST(req) {
  try {
    const { inquiryId, message } = await req.json();
    
    const inquiry = await prisma.corporateInquiry.findUnique({
      where: { id: inquiryId }
    });

    if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 1. Send the email
    await sendInquiryReplyEmail(inquiry.email, inquiry.contactName, message);

    // 2. Update status and save the note in DB
    await prisma.corporateInquiry.update({
      where: { id: inquiryId },
      data: { 
        status: "CONTACTED",
        notes: inquiry.notes ? `${inquiry.notes}\n\nREPLIED: ${message}` : `REPLIED: ${message}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}