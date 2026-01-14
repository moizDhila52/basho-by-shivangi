// app/api/admin/categories/[id]/route.js

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to create URL-friendly slugs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// PUT: Update Category
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;

    // Check if we need to update the slug
    const dataToUpdate = { name, description };
    
    // Optional: If name changed, update slug too
    if (name) {
       const slug = slugify(name);
       // Check uniqueness if slug changed (simplified check)
       const existing = await prisma.category.findUnique({ where: { slug } });
       if (!existing || existing.id === id) {
          dataToUpdate.slug = slug;
       }
    }

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update Category Error:", error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE: Remove Category AND its Products
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    
    // 1. Delete all products in this category first
    await prisma.product.deleteMany({
      where: { categoryId: id },
    });

    // 2. Delete the category itself
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category and associated products deleted' });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}