import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Update Category
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, description },
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
    
    // 1. Delete all products in this category first (Requirement)
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