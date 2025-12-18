import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export default function ProductCard({ product }) {
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden border border-stone-100 hover:shadow-md transition-all duration-300">
      
      {/* Image Container */}
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square relative overflow-hidden bg-basho-minimal">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Quick Add Overlay (Desktop) */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
            <Button className="w-full bg-white/90 text-basho-earth hover:bg-basho-clay hover:text-white backdrop-blur-sm">
              Quick View
            </Button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
            Tableware {/* We can make this dynamic later */}
          </p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg text-basho-earth hover:text-basho-clay transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <span className="font-medium text-stone-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.stock <= 0 ? (
            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
          ) : (
            <span className="text-xs text-green-600 font-medium">In Stock</span>
          )}
        </div>
      </div>
    </div>
  )
}