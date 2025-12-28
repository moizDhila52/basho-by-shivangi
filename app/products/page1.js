import { prisma } from '@/lib/db' // We need to create this lib file next!
import ProductCard from '@/components/products/ProductCard'

// 1. Fetch data directly on the server (Next.js Magic)
async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return products
}

export const metadata = {
  title: 'Shop Collection | Basho Pottery',
  description: 'Handcrafted ceramic tableware and home decor.',
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-basho-minimal py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-basho-earth mb-4">
            The Collection
          </h1>
          <p className="text-stone-600 max-w-xl mx-auto font-light">
            Functional objects made with intention. Each piece is unique, 
            bearing the marks of the maker's hands.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500">No products found. Run the seed script!</p>
          </div>
        )}
      </div>
    </div>
  )
}