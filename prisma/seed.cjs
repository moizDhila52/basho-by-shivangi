const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional - be careful in production!)
  console.log("🧹 Cleaning database...");

  // Delete in reverse order (children first) to avoid foreign key constraints
  // try {
  //   await prisma.review
  //     .deleteMany()
  //     .catch(() => console.log("No reviews to delete"));
  //   await prisma.wishlistItem
  //     .deleteMany()
  //     .catch(() => console.log("No wishlist items to delete"));
  //   await prisma.orderItem
  //     .deleteMany()
  //     .catch(() => console.log("No order items to delete"));
  //   await prisma.order
  //     .deleteMany()
  //     .catch(() => console.log("No orders to delete"));
  //   await prisma.cartItem
  //     .deleteMany()
  //     .catch(() => console.log("No cart items to delete"));
  //   await prisma.cart
  //     .deleteMany()
  //     .catch(() => console.log("No carts to delete"));
  //   await prisma.product
  //     .deleteMany()
  //     .catch(() => console.log("No products to delete"));
  //   await prisma.category
  //     .deleteMany()
  //     .catch(() => console.log("No categories to delete"));
  //   await prisma.address
  //     .deleteMany()
  //     .catch(() => console.log("No addresses to delete"));
  //   await prisma.user
  //     .deleteMany()
  //     .catch(() => console.log("No users to delete"));
  // } catch (error) {
  //   console.log("Error during cleanup:", error.message);
  // }

  // Create Users first (needed for reviews)
  console.log("👥 Creating users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: "customer@example.com",
        name: "Jane Customer",
        passwordHash: "$2a$10$dummyHashForTesting123456789012345678901234",
        phone: "+91 98765 43210",
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: "admin@basho.com",
        name: "Admin User",
        passwordHash: "$2a$10$dummyHashForTesting123456789012345678901234",
        phone: "+91 98765 43212",
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: "john@example.com",
        name: "John Smith",
        passwordHash: "$2a$10$dummyHashForTesting123456789012345678901234",
        phone: "+91 98765 43213",
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: "sarah@example.com",
        name: "Sarah Johnson",
        passwordHash: "$2a$10$dummyHashForTesting123456789012345678901234",
        phone: "+91 98765 43214",
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: "mike@example.com",
        name: "Mike Chen",
        passwordHash: "$2a$10$dummyHashForTesting123456789012345678901234",
        phone: "+91 98765 43215",
        role: "CUSTOMER",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Categories
  console.log("📦 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: randomUUID(),
        name: "Tea Ware",
        slug: "tea-ware",
        description: "Traditional and modern tea ceremony essentials",
      },
    }),
    prisma.category.create({
      data: {
        id: randomUUID(),
        name: "Dinnerware",
        slug: "dinnerware",
        description: "Handcrafted plates, bowls, and dining sets",
      },
    }),
    prisma.category.create({
      data: {
        id: randomUUID(),
        name: "Drinkware",
        slug: "drinkware",
        description: "Cups, mugs, and sake sets",
      },
    }),
    prisma.category.create({
      data: {
        id: randomUUID(),
        name: "Home Decor",
        slug: "home-decor",
        description: "Vases, sculptures, and decorative pieces",
      },
    }),
    prisma.category.create({
      data: {
        id: randomUUID(),
        name: "Ritual Objects",
        slug: "ritual-objects",
        description: "Incense holders and ceremonial items",
      },
    }),
    prisma.category.create({
      data: {
        id: randomUUID(),
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
        id: randomUUID(),
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
        material: "Stoneware",
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
    // Product 2: Bizen Ware Plate Set
    prisma.product.create({
      data: {
        id: randomUUID(),
        name: "Bizen Ware Plate Set",
        slug: "bizen-ware-plate-set",
        description:
          "Set of 4 naturally fired stoneware plates with unique ash glaze patterns. No two plates are exactly alike.",
        price: 320,
        originalPrice: 380,
        stock: 15,
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
          "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=800&q=80",
        ],
        material: "Stoneware",
        dimensions: "Ø22cm each",
        color: "Natural earth tones",
        care: "Dishwasher safe. Microwave safe.",
        leadTime: "Ships in 2-3 days",
        features: ["Dishwasher Safe", "Microwave Safe", "Oven Safe"],
        isNew: false,
        isBestseller: true,
        isFeatured: true,
        inStock: true,
        metaTitle: "Bizen Ware Plate Set - Handmade Dinner Plates | Bashō",
        metaDescription:
          "Set of 4 handmade Bizen ware plates with unique natural ash glaze patterns. Perfect for rustic dining.",
        categoryId: categories[1].id,
      },
    }),

    // Product 3: Ceramic Sake Set
    prisma.product.create({
      data: {
        id: randomUUID(),
        name: "Ceramic Sake Set",
        slug: "ceramic-sake-set",
        description:
          "Traditional sake set with two cups and a decorative flask. Perfect for intimate gatherings.",
        price: 180,
        originalPrice: 220,
        stock: 20,
        images: [
          "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=800&q=80",
          "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800&q=80",
        ],
        material: "Porcelain",
        dimensions: "Flask: H18cm, Cups: Ø6cm",
        color: "Cobalt blue on white",
        care: "Hand wash recommended",
        leadTime: "Ships in 1-2 days",
        features: ["Hand Wash Only", "Food Safe"],
        isNew: true,
        isBestseller: false,
        isFeatured: true,
        inStock: true,
        metaTitle: "Ceramic Sake Set - Traditional Japanese Drinkware | Bashō",
        metaDescription:
          "Hand-painted ceramic sake set with traditional Japanese motifs. Includes flask and two cups.",
        categoryId: categories[2].id,
      },
    }),

    // Product 4: Moon Vase
    prisma.product.create({
      data: {
        id: randomUUID(),
        name: "Moon Vase",
        slug: "moon-vase",
        description:
          "Minimalist ceramic vase inspired by the phases of the moon. Perfect for a single stem or small bouquet.",
        price: 95,
        originalPrice: 120,
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
          "https://images.unsplash.com/photo-1585314062604-1a357de8b000?w=800&q=80",
        ],
        material: "Stoneware",
        dimensions: "H20cm × W15cm",
        color: "Matte white",
        care: "Wipe clean with damp cloth",
        leadTime: "Ships in 3-4 days",
        features: ["Hand Wash Only"],
        isNew: true,
        isBestseller: true,
        isFeatured: false,
        inStock: true,
        metaTitle: "Moon Vase - Minimalist Ceramic Vase | Bashō",
        metaDescription:
          "Hand-thrown minimalist ceramic vase inspired by moon phases. Perfect for modern interiors.",
        categoryId: categories[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create Reviews
  console.log("⭐ Creating reviews...");
  const reviews = await Promise.all([
    // Reviews for Kintsugi Tea Bowl (Product 0)
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "Absolutely stunning! The gold accents are beautiful and the bowl feels perfect in my hands. I use it every morning for my matcha ritual.",
        productId: products[0].id,
        userId: users[0].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "Beautiful craftsmanship. The bowl has a wonderful weight and balance. Highly recommend!",
        productId: products[0].id,
        userId: users[2].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 4,
        comment:
          "Great quality bowl, though a bit pricey. The gold details are lovely and it's clearly handmade with care.",
        productId: products[0].id,
        userId: users[3].id,
        isVerified: true,
      },
    }),

    // Reviews for Bizen Ware Plate Set (Product 1)
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "These plates are incredible! Each one is unique with its own character. They make every meal feel special.",
        productId: products[1].id,
        userId: users[0].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "Stunning plates with gorgeous natural glazing. They're sturdy and functional while being works of art.",
        productId: products[1].id,
        userId: users[4].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 4,
        comment:
          "Beautiful set, exactly as described. The natural patterns are unique to each plate. Very satisfied!",
        productId: products[1].id,
        userId: users[2].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "Best dinnerware I've ever owned. The quality is exceptional and they look amazing on the table.",
        productId: products[1].id,
        userId: users[3].id,
        isVerified: true,
      },
    }),

    // Reviews for Ceramic Sake Set (Product 2)
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 4,
        comment:
          "Lovely sake set with traditional design. Perfect for entertaining guests. The cobalt blue is gorgeous.",
        productId: products[2].id,
        userId: users[2].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "Bought this as a gift and my friend absolutely loved it! The hand-painted details are exquisite.",
        productId: products[2].id,
        userId: users[4].id,
        isVerified: true,
      },
    }),

    // Reviews for Moon Vase (Product 3)
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "Perfect minimalist vase! Looks amazing with a single flower stem. The matte white finish is beautiful.",
        productId: products[3].id,
        userId: users[0].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment:
          "Simple and elegant. Exactly what I was looking for. Great quality and fast shipping!",
        productId: products[3].id,
        userId: users[3].id,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 4,
        comment:
          "Beautiful vase that fits perfectly in my modern home. Well-made and looks expensive.",
        productId: products[3].id,
        userId: users[4].id,
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  console.log("🎉 Seeding completed successfully!");

  // Display summary
  console.log("\n📊 Summary:");
  console.log(`   Users: ${users.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Reviews: ${reviews.length}`);
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
