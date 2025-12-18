'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

// Wrap in Suspense for Next.js 15+ safety
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="bg-stone-50 p-8 md:p-12 rounded-lg border border-stone-100 text-center max-w-lg mx-auto shadow-sm">
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-16 h-16 text-basho-clay" />
      </div>
      
      <h1 className="text-3xl font-serif text-basho-earth mb-4">
        Thank you!
      </h1>
      
      <p className="text-stone-600 mb-8">
        Your order has been placed successfully. We are preparing your clay treasures for shipment.
      </p>

      {orderId && (
        <div className="bg-white p-4 rounded border border-stone-200 mb-8">
          <p className="text-xs text-stone-500 uppercase tracking-wider">Order Reference</p>
          <p className="font-mono text-basho-earth font-medium mt-1">{orderId}</p>
        </div>
      )}

      <Link href="/products">
        <Button className="w-full bg-basho-earth hover:bg-basho-clay text-white py-6">
          Continue Shopping
        </Button>
      </Link>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}