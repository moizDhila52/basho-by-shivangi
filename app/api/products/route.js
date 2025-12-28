import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "featured";
    const search = searchParams.get("search");
    const minPrice = parseFloat(searchParams.get("minPrice"));
    const maxPrice = parseFloat(searchParams.get("maxPrice"));
    const material = searchParams.get("material")?.split(",");
    const features = searchParams.get("features")?.split(",");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Category filter (only apply if not 'all')
    if (category && category !== "all") {
      where.category = {
        slug: category,
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    // Material filter
    if (material && material.length > 0) {
      where.material = {
        in: material,
      };
    }

    // Features filter
    if (features && features.length > 0) {
      where.AND = features.map((feature) => ({
        features: {
          has: feature,
        },
      }));
    }

    // Build orderBy clause
    let orderBy = {};
    switch (sort) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "bestseller":
        orderBy = [{ isBestseller: "desc" }, { createdAt: "desc" }];
        break;
      case "featured":
      default:
        orderBy = [
          { isFeatured: "desc" },
          { isBestseller: "desc" },
          { createdAt: "desc" },
        ];
        break;
    }

    // Fetch products with categories and reviews
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          // For wishlist functionality
          wishlistItems: {
            select: {
              userId: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform products to include aggregated rating
    const transformedProducts = products.map((product) => ({
      ...product,
      _count: {
        reviews: product.reviews.length,
      },
      averageRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
