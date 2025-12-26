import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    // Try to find by slug first
    let product = await prisma.product.findUnique({
      where: { slug },
      include: {
        Category: true,
        Review: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          where: {
            isVerified: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            Review: true,
            WishlistItem: true,
          },
        },
      },
    });

    // If not found by slug, try by ID (in case someone passes ID as slug)
    if (!product) {
      product = await prisma.product.findUnique({
        where: { id: slug },
        include: {
          Category: true,
          Review: {
            include: {
              User: {
                // Changed from 'user' to 'User'
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            where: {
              isVerified: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              Review: true,
              WishlistItem: true,
            },
          },
        },
      });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate average rating
    let averageRating = 0;
    if (product.Review.length > 0) {
      // Changed from 'reviews' to 'Review'
      const totalRating = product.Review.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = totalRating / product.Review.length;
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: {
          not: product.id,
        },
        inStock: true,
      },
      take: 3,
      include: {
        Category: true, // Changed from 'category' to 'Category'
        Review: true, // Changed from 'reviews' to 'Review'
      },
    });

    // Format product data
    const formattedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      images: product.images,
      material: product.material,
      dimensions: product.dimensions,
      color: product.color,
      care: product.care,
      leadTime: product.leadTime,
      shipping: "Free shipping on orders over $200", // Default or from DB
      features: product.features,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      isFeatured: product.isFeatured,
      inStock: product.inStock,
      averageRating,
      reviewCount: product._count.Review, // Changed from 'reviews' to 'Review'
      wishlistCount: product._count.WishlistItem, // Changed from 'wishlistItems' to 'WishlistItem'
      category: product.Category, // Changed from 'category' to 'Category'
      reviews: product.Review, // Changed from 'reviews' to 'Review'
    };

    // Format related products
    const formattedRelatedProducts = relatedProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.Category.name, // Changed from 'category' to 'Category'
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images?.[0] || "/placeholder-image.jpg",
      inStock: p.inStock,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      rating:
        p.Review.length > 0 // Changed from 'reviews' to 'Review'
          ? p.Review.reduce((sum, r) => sum + r.rating, 0) / p.Review.length
          : 0,
      reviewCount: p.Review.length, // Changed from 'reviews' to 'Review'
    }));

    return NextResponse.json({
      success: true,
      product: formattedProduct,
      relatedProducts: formattedRelatedProducts,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
