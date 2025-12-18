'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const cart = useCart()
  const [isMounted, setIsMounted] = useState(false)

  // Avoid Hydration Mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Calculate Total
  const total = cart.items.reduce((sum, item) => {
    return sum + Number(item.price)
  }, 0)

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-serif text-basho-earth">Your cart is empty</h2>
        <p className="text-stone-500">Looks like you haven't added any pottery yet.</p>
        <Link href="/products">
          <Button className="bg-basho-earth text-white hover:bg-basho-clay mt-4">
            Browse Collection
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif text-basho-earth mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: Cart Items List */}
        <div className="lg:col-span-7">
          <ul className="divide-y divide-stone-100 border-t border-b border-stone-100">
            {cart.items.map((item) => (
              <li key={item.id} className="flex py-6">
                {/* Image */}
                <div className="relative h-24 w-24 rounded-md overflow-hidden border border-stone-100 sm:h-32 sm:w-32 bg-stone-50">
                  <Image
                    src={item.images?.[0] || '/placeholder.jpg'} // Fallback if image missing
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <h3 className="text-lg font-medium text-basho-earth">
                        <Link href={`/products/${item.slug || ''}`}>{item.name}</Link>
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">{item.category?.name || 'Tableware'}</p>
                      <p className="mt-2 font-medium text-stone-900">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                      {/* Remove Button */}
                      <button
                        onClick={() => cart.removeItem(item.id)}
                        className="absolute right-0 top-0 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-lg bg-stone-50 px-4 py-6 sm:p-6 lg:p-8">
            <h2 className="text-lg font-medium text-basho-earth">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                <div className="text-base font-medium text-stone-900">Order Total</div>
                <div className="text-base font-medium text-stone-900">
                  ₹{total.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {/* This button will trigger Checkout later */}
             <Link href="/checkout">
  <Button className="w-full bg-basho-earth hover:bg-basho-clay text-white py-6 text-lg">
    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
  </Button>
</Link>
            </div>
            
            <p className="mt-4 text-xs text-center text-stone-500">
              Shipping & taxes calculated at checkout.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}