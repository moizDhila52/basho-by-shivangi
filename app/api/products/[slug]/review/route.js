import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Force dynamic to ensure we check fresh data
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ canReview: false }, { status: 200 });
    }

    // 1. Get current user to access their email
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    const { slug } = await params;

    // 2. Get product
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ canReview: false }, { status: 200 });
    }

    // 3. PRIORITY CHECK: Is there a DELIVERED purchase?
    const deliveredPurchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        Order: {
          OR: [
            { userId: session.userId },
            { customerEmail: currentUser?.email },
          ],
          status: 'DELIVERED', // 👈 Specific check for delivery
        },
      },
    });

    // 4. FALLBACK CHECK: If not delivered, is there ANY active purchase?
    // (Used to show the "Order is on the way" message)
    let anyPurchase = deliveredPurchase;
    if (!deliveredPurchase) {
      anyPurchase = await prisma.orderItem.findFirst({
        where: {
          productId: product.id,
          Order: {
            OR: [
              { userId: session.userId },
              { customerEmail: currentUser?.email },
            ],
            status: {
              in: ['CONFIRMED', 'SHIPPED', 'PROCESSING', 'PENDING'],
            },
          },
        },
      });
    }

    // 5. Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: session.userId,
      },
    });

    // 6. Set Flags
    const isDelivered = !!deliveredPurchase; // True ONLY if we found a delivered order
    const hasPurchased = !!anyPurchase; // True if we found ANY order (Delivered or otherwise)

    return NextResponse.json({
      canReview: isDelivered && !existingReview,
      hasPurchased: hasPurchased,
      isDelivered: isDelivered,
      hasReviewed: !!existingReview,
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json({ canReview: false }, { status: 200 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    const { slug } = await params;
    const { rating, comment, images } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2. Verify Purchase AND Delivery Status
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        Order: {
          OR: [
            { userId: session.userId },
            { customerEmail: currentUser?.email },
          ],
          // 👇 STRICT CHECK: Only allow submission if DELIVERED
          status: 'DELIVERED',
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'You can only review products that have been delivered.' },
        { status: 403 },
      );
    }

    // 3. Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: session.userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 },
      );
    }

    // 4. Create Review
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
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 },
    );
  }
}
