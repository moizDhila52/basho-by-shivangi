import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // 1. Fetch all orders
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // 2. Group orders by Email to find unique customers
    const customerMap = new Map()

    orders.forEach(order => {
      const email = order.customerEmail
      
      if (!customerMap.has(email)) {
        // New Customer Found
        customerMap.set(email, {
          id: email, // Use email as ID for guests
          name: order.customerName,
          email: email,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          status: 'New'
        })
      }

      // Update Stats
      const customer = customerMap.get(email)
      customer.totalOrders += 1
      customer.totalSpent += Number(order.total)
      
      // VIP Logic: If spent > 10000, mark as VIP
      if (customer.totalSpent > 10000) customer.status = 'VIP'
      else if (customer.totalOrders > 1) customer.status = 'Returning'
    })

    // Convert Map to Array
    const customers = Array.from(customerMap.values())

    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}