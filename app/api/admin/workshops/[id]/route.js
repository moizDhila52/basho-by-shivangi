import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch single workshop with sessions AND registrations
export async function GET(req, { params }) {
  try {
    const { id } = await params; // Await params in Next.js 15

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        WorkshopSession: {
          orderBy: { date: "asc" },
          include: {
            // INCLUDE REGISTRATIONS SO ADMIN CAN SEE THEM
            WorkshopRegistration: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!workshop)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(workshop);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.workshop.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
