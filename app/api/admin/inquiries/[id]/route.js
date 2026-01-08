import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: Update Status or Admin Notes
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // We might update status, notes, or both
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
    console.error("Inquiry Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete (set isActive: false) or Hard Delete
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    // We'll use hard delete to keep it clean, but you could toggle isActive to false
    await prisma.corporateInquiry.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Inquiry deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
