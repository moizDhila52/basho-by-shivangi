// app/api/testimonials/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    // TODO: Add authentication check for admin
    const { id } = params;
    const body = await request.json();

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        approved: body.approved,
        featured: body.featured,
        customerName: body.customerName,
        customerRole: body.customerRole,
        content: body.content,
        rating: body.rating,
        image: body.image,
        videoUrl: body.videoUrl,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: "Testimonial updated successfully",
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}
