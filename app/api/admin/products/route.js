import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 1. GET: Fetch all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// 2. POST: Create a new product
export async function POST(req) {
  try {
    const body = await req.json()
    const { name, description, price, categoryId, imageUrl } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price), // Ensure it's a number
        categoryId,
        images: [imageUrl], // We store it as an array of strings
        slug: name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

// 3. DELETE: Remove a product
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    await prisma.product.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}