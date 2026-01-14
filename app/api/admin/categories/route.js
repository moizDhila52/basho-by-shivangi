// app/api/admin/categories/route.js

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to create URL-friendly slugs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Product: true }
        }
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name
    let slug = slugify(name);
    
    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}