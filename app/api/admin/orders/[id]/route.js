import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: Update Order Status
export async function PATCH(req, { params }) {
  try {
    const { id } = await params; // Await params for Next.js 15
    const { status } = await req.json();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        User: { select: { name: true, email: true } },
        OrderItem: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE: Cancel/Delete Order (Optional)
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ message: "Order deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
