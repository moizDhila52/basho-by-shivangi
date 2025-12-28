const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional - be careful in production!)
  console.log("🧹 Cleaning database...");

  // Delete in reverse order (children first) to avoid foreign key constraints
  try {
    // First, check and delete from tables that might not exist
    await prisma.review
      .deleteMany()
      .catch(() => console.log("No reviews to delete"));
    await prisma.wishlistItem
      .deleteMany()
      .catch(() => console.log("No wishlist items to delete"));
    await prisma.orderItem
      .deleteMany()
      .catch(() => console.log("No order items to delete"));
    await prisma.order
      .deleteMany()
      .catch(() => console.log("No orders to delete"));
    await prisma.product
      .deleteMany()
      .catch(() => console.log("No products to delete"));
    await prisma.category
      .deleteMany()
      .catch(() => console.log("No categories to delete"));
    await prisma.address
      .deleteMany()
      .catch(() => console.log("No addresses to delete"));
    await prisma.user
      .deleteMany()
      .catch(() => console.log("No users to delete"));
  } catch (error) {
    console.log("Error during cleanup:", error.message);
  }

  // Create Categories
  console.log("📦 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Tea Ware",
        slug: "tea-ware",
        description: "Traditional and modern tea ceremony essentials",
      },
    }),
    prisma.category.create({
      data: {
        name: "Dinnerware",
        slug: "dinnerware",
        description: "Handcrafted plates, bowls, and dining sets",
      },
    }),
    prisma.category.create({
      data: {
        name: "Drinkware",
        slug: "drinkware",
        description: "Cups, mugs, and sake sets",
      },
    }),
    prisma.category.create({
      data: {
        name: "Home Decor",
        slug: "home-decor",
        description: "Vases, sculptures, and decorative pieces",
      },
    }),
    prisma.category.create({
      data: {
        name: "Ritual Objects",
        slug: "ritual-objects",
        description: "Incense holders and ceremonial items",
      },
    }),
    prisma.category.create({
      data: {
        name: "Seasonal",
        slug: "seasonal",
        description: "Limited edition seasonal collections",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create Products
  console.log("🎨 Creating products...");
  const products = await Promise.all([
    // Product 1: Kintsugi Tea Bowl
    prisma.product.create({
      data: {
        name: "Kintsugi Tea Bowl",
        slug: "kintsugi-tea-bowl",
        description: "Hand-thrown matcha bowl with gold repair accents",
        price: 245,
        originalPrice: 295,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
          "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
          "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80",
        ],
        material: "Stoneware with kintsugi-inspired glaze",
        dimensions: "Ø12cm × H8cm",
        color: "Terracotta with gold",
        care: "Hand wash recommended to preserve gold accents",
        leadTime: "Ships in 3-5 days",
        features: ["Microwave Safe", "Dishwasher Safe", "Food Safe"],
        isNew: true,
        isBestseller: true,
        isFeatured: true,
        inStock: true,
        metaTitle: "Kintsugi Tea Bowl - Handcrafted Matcha Bowl | Bashō",
        metaDescription:
          "Authentic hand-thrown matcha bowl with beautiful kintsugi-inspired gold accents. Perfect for traditional tea ceremonies.",
        categoryId: categories[0].id,
      },
    }),
    // Add more products as needed...
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create Users
  console.log("👥 Creating users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "customer@example.com",
        name: "Jane Customer",
        passwordHash: "$2a$10$dummyHashForTesting123456789012345678901234",
        phone: "+91 98765 43210",
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        email: "admin@basho.com",
        name: "Admin User",
        passwordHash: "$2a$10$dummyHashForTesting123456789012345678901234",
        phone: "+91 98765 43212",
        role: "ADMIN",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  console.log("🎉 Seeding completed successfully!");
}

// Execute the main function and handle errors
main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma connection
    await prisma.$disconnect();
  });
