const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // 1. Clean the database (Delete old data to avoid duplicates)
  // Note: We delete in order to avoid foreign key constraint errors
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Database cleaned.')

  // 2. Create Categories
  const tableware = await prisma.category.create({
    data: {
      name: 'Tableware',
      slug: 'tableware',
      description: 'Functional pottery for daily rituals.',
    }
  })

  const decor = await prisma.category.create({
    data: {
      name: 'Home Decor',
      slug: 'decor',
      description: 'Vases and statement pieces for your sanctuary.',
    }
  })

  const workshops = await prisma.category.create({
    data: {
      name: 'Workshops',
      slug: 'workshops',
      description: 'Hands-on experiences at the studio.',
    }
  })

  console.log('📁 Categories created.')

  // 3. Create Products
  // 3. Create Products with FIXED images
  const products = [
    {
      name: 'Wabi-Sabi Matcha Bowl',
      slug: 'wabi-sabi-matcha-bowl',
      description: 'Hand-pinched tea bowl with a rustic Shino glaze. Perfect for your morning ceremony.',
      price: 1800,
      stock: 12,
      images: ['https://images.unsplash.com/photo-1578749556920-d78852e77f24?q=80&w=800&auto=format&fit=crop'],
      categoryId: tableware.id
    },
    {
      name: 'Stoneware Dinner Set (4pc)',
      slug: 'stoneware-dinner-set',
      description: 'A complete dinner set including dinner plate, quarter plate, and bowl. Finished in matte white.',
      price: 4500,
      stock: 5,
      images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop'],
      categoryId: tableware.id
    },
    {
      name: 'Speckled Clay Vase',
      slug: 'speckled-clay-vase',
      description: 'Tall cylindrical vase made from speckled clay, left unglazed on the outside for texture.',
      price: 2200,
      stock: 8,
      images: ['https://images.unsplash.com/photo-1581783342308-f792ca11df53?q=80&w=800&auto=format&fit=crop'],
      categoryId: decor.id
    },
    {
      name: 'Hand-Building Workshop',
      slug: 'hand-building-workshop-jan',
      description: 'A 2-hour session learning the basics of pinching and coiling. Includes all materials and firing.',
      price: 1500,
      stock: 20,
      images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop'],
      categoryId: workshops.id
    }
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }

  console.log(`📦 Added ${products.length} products.`)
  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })