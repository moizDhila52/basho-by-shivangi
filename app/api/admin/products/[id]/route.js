import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT: Update a product
export async function PUT(req, { params }) {
  try {
    // --- FIX: Await params because it is a Promise in Next.js 15+ ---
    const { id } = await params;

    const body = await req.json();

    // Strip out fields that cannot be updated directly
    const {
      id: _id,
      createdAt,
      updatedAt,
      Category,
      _count,
      ...updateData
    } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        // Ensure numeric types
        price: parseFloat(updateData.price),
        stock: parseInt(updateData.stock),
        originalPrice: updateData.originalPrice
          ? parseFloat(updateData.originalPrice)
          : null,
        // Calculate boolean logic
        inStock: parseInt(updateData.stock) > 0,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("UPDATE Product Error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a product
export async function DELETE(req, { params }) {
  try {
    // --- FIX: Await params here as well ---
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
