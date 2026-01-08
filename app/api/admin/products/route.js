import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper to create slugs
const createSlug = (name) => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Date.now().toString().slice(-4)
  );
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const where = {};
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        Category: true, // Note: Prisma convention is usually TitleCase for relation if not defined otherwise, checking schema... yours is 'Category' based on relation field
        _count: { select: { OrderItem: true } }, // Useful for analytics later
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Destructure and validate required fields
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      images,
      material,
      features,
      dimensions,
      color,
      care,
      leadTime,
      isFeatured,
      isBestseller,
      isNew,
      originalPrice,
      metaTitle,
      metaDescription,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: createSlug(name),
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: images || [], // Array of strings
        categoryId,
        material,
        features: features || [],
        dimensions,
        color,
        care,
        leadTime,
        isFeatured: isFeatured || false,
        isBestseller: isBestseller || false,
        isNew: isNew || false,
        inStock: parseInt(stock) > 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        metaTitle,
        metaDescription,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("CREATE Product Error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
