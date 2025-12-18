'use client'

import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/Button'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Script from 'next/script' // <-- Import Script

export default function CheckoutPage() {
  const cart = useCart()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '', email: '', address: '', city: '', postalCode: '', phone: ''
  })

  useEffect(() => { setIsMounted(true) }, [])

  // Kick out empty cart
  useEffect(() => {
    if (isMounted && cart.items.length === 0) router.push('/cart')
  }, [isMounted, cart.items, router])

  if (!isMounted) return null

  const total = cart.items.reduce((sum, item) => sum + Number(item.price), 0)

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 1. Triggered when user clicks "Pay Now"
  const onCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Step A: Create Order on Razorpay
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      })
      const orderData = await response.json()

      // Step B: Define Options for the Payment Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key here
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Basho Pottery",
        description: "Handcrafted Clayware",
        order_id: orderData.id, // This is the ID we just got
        handler: async function (response) {
          // Step C: Payment Success! Now save to DB
          await saveOrder(response.razorpay_payment_id)
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#8B4513" // Basho Clay Color
        }
      }

      // Step D: Open the Modal
      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
      setLoading(false) // Stop loading state so user can interact

    } catch (error) {
      console.error(error)
      toast.error("Payment initialization failed")
      setLoading(false)
    }
  }

  // 2. Save Order to Database (Called after payment success)
  const saveOrder = async (paymentId) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          customerDetails: formData,
          paymentId: paymentId // We attach the Payment ID now!
        })
      })

      if (!response.ok) throw new Error('Failed to save order')
      
      const data = await response.json()
      
      cart.removeAll()
      router.push(`/success?orderId=${data.orderId}`)
      toast.success("Payment Successful!")

    } catch (error) {
      toast.error("Payment successful but order saving failed. Contact support.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Load Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <h1 className="text-3xl font-serif text-basho-earth mb-8">Checkout</h1>
      
      <div className="bg-stone-50 p-6 rounded-lg border border-stone-100">
        <h2 className="font-medium text-lg mb-4">Shipping Details</h2>
        
        <form onSubmit={onCheckout} className="space-y-4">
          {/* ... Inputs remain the same ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required name="name" placeholder="Full Name" onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded"/>
            <input required name="phone" placeholder="Phone Number" onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded"/>
          </div>
          <input required name="email" type="email" placeholder="Email" onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded"/>
          <input required name="address" placeholder="Address" onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded"/>
          <div className="grid grid-cols-2 gap-4">
            <input required name="city" placeholder="City" onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded"/>
            <input required name="postalCode" placeholder="Postal Code" onChange={handleInputChange} className="w-full p-3 border border-stone-200 rounded"/>
          </div>

          <div className="border-t border-stone-200 pt-4 mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-stone-600">Total Amount</span>
              <span className="text-xl font-bold text-basho-earth">₹{total.toLocaleString('en-IN')}</span>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full bg-basho-earth hover:bg-basho-clay text-white py-4 text-lg">
              {loading ? 'Processing...' : 'Pay with Razorpay'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}