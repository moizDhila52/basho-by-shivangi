import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      service, // mapped to 'interest'
      teamSize, // mapped to 'companySize'
      budget,
      timeline,
      message,
    } = body;

    // Basic Validation
    if (!companyName || !contactName || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the inquiry record
    const inquiry = await prisma.corporateInquiry.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        companySize: teamSize, // Mapping frontend field to DB field
        // Storing service, budget, timeline in the string array 'interest' or strictly mapping logic
        interest: [service, budget, timeline].filter(Boolean),
        message,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error("Inquiry Submission Error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
