import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// This function handles the POST request when the user hits "Place Order"
export async function POST(req) {
  try {
    const body = await req.json()
    const { items, customerDetails,paymentId } = body

    if (!items || items.length === 0) {
      return new NextResponse("No items in checkout", { status: 400 })
    }

    // 1. Calculate the total (Don't trust the frontend! Recalculate here if you want to be safe)
    const total = items.reduce((sum, item) => sum + Number(item.price), 0)

    // 2. Create the Order in Database
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`, // Simple ID generation
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        address: customerDetails, // Stores the whole JSON object
        total: total,
        status: paymentId ? 'PROCESSING' : 'PENDING',// Default status
        paymentId: paymentId || null,
        // 3. Create the OrderItems automatically
        items: {
          create: items.map((item) => ({
            product: { connect: { id: item.id } },
            quantity: 1, // Simple quantity for now
            price: item.price
          }))
        }
      }
    })

    return NextResponse.json({ orderId: order.id })

  } catch (error) {
    console.log('[CHECKOUT_ERROR]', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}   