import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req) {
  try {
    const { orderId, status } = await req.json();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    });

    // Optional: Send an email here to notify user of status change

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}