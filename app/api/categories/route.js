import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path matches your project structure

// Helper to create slugs
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// 1. GET: Fetch all categories with Product Counts
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Product: true }, // <--- THIS FIXES THE ZERO COUNT
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET Categories Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new category
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate basic slug
    let slug = createSlug(name);

    // Check for collision
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('CREATE Category Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}