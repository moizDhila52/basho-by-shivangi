// app/api/products/[slug]/review/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ canReview: false }, { status: 200 });
    }

    // Get product by slug
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ canReview: false }, { status: 200 });
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        Order: {
          userId: session.userId,
          status: {
            in: ["DELIVERED", "CONFIRMED", "SHIPPED"],
          },
        },
      },
      include: {
        Order: {
          select: {
            status: true,
            orderNumber: true,
          },
        },
      },
    });

    // Check if user has already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: session.userId,
      },
    });

    const result = {
      canReview: !!hasPurchased && !existingReview,
      hasPurchased: !!hasPurchased,
      hasReviewed: !!existingReview,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json({ canReview: false }, { status: 200 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { rating, comment, images } = await request.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        Order: {
          userId: session.userId,
          status: {
            in: ["DELIVERED", "CONFIRMED", "SHIPPED"],
          },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You must purchase this product before reviewing" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: session.userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: parseFloat(rating),
        comment: comment?.trim() || null,
        productId: product.id,
        userId: session.userId,
        isVerified: true,
        images: images || [],
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
