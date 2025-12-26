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
        category: true,
        reviews: {
          include: {
            user: {
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
            reviews: true,
            wishlistItems: true,
          },
        },
      },
    });

    // If not found by slug, try by ID (in case someone passes ID as slug)
    if (!product) {
      product = await prisma.product.findUnique({
        where: { id: slug },
        include: {
          category: true,
          reviews: {
            include: {
              user: {
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
              reviews: true,
              wishlistItems: true,
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
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = totalRating / product.reviews.length;
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
        category: true,
        reviews: true,
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
      reviewCount: product._count.reviews,
      wishlistCount: product._count.wishlistItems,
      category: product.category,
      reviews: product.reviews,
    };

    // Format related products
    const formattedRelatedProducts = relatedProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images?.[0] || "/placeholder-image.jpg",
      inStock: p.inStock,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      rating:
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0,
      reviewCount: p.reviews.length,
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
