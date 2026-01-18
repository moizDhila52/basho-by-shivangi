// app/api/custom-orders/showcase/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "3");

    // Fetch completed custom orders to showcase
    const customOrders = await prisma.customOrder.findMany({
      where: {
        status: "COMPLETED",
        showcaseWorthy: true, // Only show orders marked as showcase-worthy
      },
      orderBy: {
        completedAt: "desc", // Show newest completed orders first
      },
      take: limit,
      select: {
        id: true,
        productType: true,
        material: true,
        glaze: true,
        files: true,
        specialRequirements: true,
        contactName: true,
        createdAt: true,
        completedAt: true,
        estimatedCompletion: true,
        quantity: true,
      },
    });

    // Transform the data for display
    const showcaseOrders = customOrders.map((order) => {
      // Create a descriptive title
      const title =
        order.quantity > 1
          ? `${order.productType} Set (${order.quantity} pieces)`
          : order.productType;

      // Create description from special requirements or default text
      const description = order.specialRequirements
        ? order.specialRequirements.length > 150
          ? order.specialRequirements.substring(0, 150) + "..."
          : order.specialRequirements
        : `Custom ${order.productType.toLowerCase()} crafted with ${order.material.toLowerCase()}`;

      // Get customer first name only for privacy
      const customerFirstName = order.contactName
        ? order.contactName.split(" ")[0]
        : "Anonymous";

      return {
        id: order.id,
        title,
        description,
        images:
          Array.isArray(order.files) && order.files.length > 0
            ? order.files.slice(0, 2) // Only show first 2 images
            : [
                // Fallback placeholder image
                "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop",
              ],
        material: order.material || "Stoneware",
        glaze: order.glaze || "Custom Finish",
        timeline: order.estimatedCompletion || "6 weeks",
        customer: customerFirstName,
        completedAt: order.completedAt,
      };
    });

    return NextResponse.json(showcaseOrders);
  } catch (error) {
    console.error("GET Custom Orders Showcase Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom orders showcase" },
      { status: 500 }
    );
  }
}
