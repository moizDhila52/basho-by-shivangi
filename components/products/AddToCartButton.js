'use client'

import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/use-cart'

export default function AddToCartButton({ product }) {
  const cart = useCart()

  if (!product || !product.price) {
    return null;
  }
  
  const onAddToCart = () => {
    cart.addItem(product)
    alert('Added to cart!') // We will replace this with a nice toast later
  }

  return (
    <Button 
      onClick={onAddToCart}
      size="lg" 
      className="w-full md:w-auto text-lg py-6 bg-basho-earth hover:bg-basho-clay text-white"
    >
      Add to Cart • ₹{product.price.toLocaleString('en-IN')}
    </Button>
  )
}