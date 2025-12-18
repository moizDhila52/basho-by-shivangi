import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(req) {
  try {
    const body = await req.json()
    const { amount } = body

    // Razorpay expects amount in PAISE (multiply by 100)
    // Example: ₹500 becomes 50000 paise
    const options = {
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: 'order_' + Date.now(),
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json(order)
  } catch (error) {
    console.error('Razorpay Error:', error)
    return new NextResponse('Error creating order', { status: 500 })
  }
}