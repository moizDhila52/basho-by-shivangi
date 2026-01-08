import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, customerName, customerEmail, amount } = body;

    // 1. Transaction to ensure no overbooking
    const result = await prisma.$transaction(async (tx) => {
      // A. Get current session state
      const session = await tx.workshopSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) throw new Error("Session not found");

      // B. Check Availability
      if (session.spotsBooked >= session.spotsTotal) {
        throw new Error("Sold Out");
      }

      // C. Create Registration Record
      const registration = await tx.workshopRegistration.create({
        data: {
          sessionId,
          customerName,
          customerEmail,
          amountPaid: parseFloat(amount),
          paymentStatus: "paid", // Assuming immediate payment or marking as booked
        },
      });

      // D. Update Slots (Increment booked count)
      await tx.workshopSession.update({
        where: { id: sessionId },
        data: { spotsBooked: { increment: 1 } },
      });

      return registration;
    });

    return NextResponse.json({ success: true, registration: result });
  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json(
      {
        error:
          error.message === "Sold Out"
            ? "This session is fully booked."
            : "Booking failed.",
      },
      { status: 400 }
    );
  }
}
