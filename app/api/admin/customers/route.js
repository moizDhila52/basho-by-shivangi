import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { Product: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Category Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, description, slug } = await req.json();

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category Create Error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { id, name, description, slug } = await req.json();

    const category = await prisma.category.update({
      where: { id },
      data: { name, description, slug },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
