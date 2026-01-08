import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    await prisma.product.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ message: "Products deleted successfully" });
  } catch (error) {
    console.error("BULK DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 }
    );
  }
}
