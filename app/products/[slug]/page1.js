import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import AddToCartButton from '@/components/products/AddToCartButton'
import { Button } from '@/components/ui/Button'
import { Check, Truck, ShieldCheck } from 'lucide-react'

// 1. Fetch the specific product
async function getProduct(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true }
  })
  return product
}

// 2. Metadata Generation (Fixed for Next.js 15)
export async function generateMetadata(props) {
  const params = await props.params; // Await the params
  const product = await getProduct(params.slug)
  
  if (!product) return { title: 'Product Not Found' }
  
  return {
    title: `${product.name} | Basho Pottery`,
    description: product.description,
  }
}

// 3. Main Page Component (Fixed for Next.js 15)
export default async function ProductPage(props) {
  const params = await props.params; // Await the params first
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        
        {/* Breadcrumb */}
        <div className="text-sm text-stone-500 mb-8 font-medium">
          <span className="hover:text-basho-clay cursor-pointer">Shop</span> 
          <span className="mx-2">/</span> 
          <span className="hover:text-basho-clay cursor-pointer">{product.category.name}</span>
          <span className="mx-2">/</span>
          <span className="text-basho-earth">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-basho-minimal rounded-lg overflow-hidden border border-stone-100">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col">
            <h1 className="font-serif text-3xl md:text-4xl text-basho-earth mb-4">
              {product.name}
            </h1>
            
            <div className="text-2xl font-medium text-stone-900 mb-6">
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <div className="prose prose-stone mb-8 text-stone-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Action Area */}
          <div className="border-t border-b border-stone-100 py-6 mb-8">
  <div className="flex flex-col gap-4">
    {product.stock > 0 ? (
      <AddToCartButton product={{
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category
      }} />
    ) : (
      <Button size="lg" disabled className="w-full md:w-auto text-lg py-6">
        Out of Stock
      </Button>
    )}
                <p className="text-xs text-center md:text-left text-stone-500 mt-2">
                  {product.stock} pieces available currently.
                </p>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 gap-4 text-sm text-stone-600">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-basho-clay" />
                <span>Free shipping on orders over ₹2000</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-basho-clay" />
                <span>Handcrafted & Food Safe Glazes</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-basho-clay" />
                <span>Secure Payments via Razorpay</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}