import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure you have your singleton prisma instance

// ==========================================
// GET HANDLER
// Fetches testimonials with optional filters
// ==========================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. FILTER LOGIC
    // If "approved=true", fetch only active & approved (Public View)
    // If param missing, fetch ALL (Admin View)
    const approvedOnly = searchParams.get("approved") === "true";
    const source = searchParams.get("source");
    const minRating = searchParams.get("minRating");
    const featured = searchParams.get("featured");

    const where = {
      ...(approvedOnly && { approved: true, isActive: true }),
      ...(source && source !== "all" && { source }),
      ...(featured === "true" && { featured: true }),
      ...(minRating && minRating !== "all" && {
        rating: { gte: parseFloat(minRating) },
      }),
    };

    // 2. DB FETCH
    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        Product: { select: { name: true, slug: true } },
        Workshop: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error("Testimonials API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// ==========================================
// POST HANDLER
// Creates a new testimonial (Anonymous aware)
// ==========================================
export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. DESTRUCTURE FIELDS
    const { 
      customerName, 
      customerRole, 
      content, 
      rating, 
      image, 
      videoUrl, 
      isAnonymous, // <--- Key addition from your request
      source,
      productId,
      workshopId
    } = body;
    
    // 2. VALIDATION
    if (!customerName || !content || !rating) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. CREATE ENTRY
    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        customerRole,
        content,
        rating: parseFloat(rating), // Handle decimals (e.g. 4.5)
        image,
        videoUrl,
        source: source || "Website",
        
        // STATUS FLAGS
        approved: false, // Default false (Admin must approve)
        isActive: true,
        isAnonymous: isAnonymous || false, // <--- Correctly saves boolean
        
        // OPTIONAL RELATIONS
        productId: productId || null,
        workshopId: workshopId || null,
      },
    });

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error("Create Testimonial Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}