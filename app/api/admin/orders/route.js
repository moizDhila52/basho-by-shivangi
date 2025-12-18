import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/admin/orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, // Newest first
      include: {
        items: {
          include: { product: true } // Get the product details too
        }
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
// PATCH: Update Order Status
export async function PATCH(req) {
  try {
    const body = await req.json()
    const { orderId, status } = body

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}