const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  console.log("🧹 Cleaning database...");
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  }

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

  const teaware = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: "Tea Ware",
      slug: "tea-ware",
      description: "Traditional and modern tea ceremony essentials",
    },
  });  
  const dinnerware = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: "Dinnerware",
      slug: "dinnerware",
      description: "Handcrafted plates, bowls, and dining sets",
    },
  });
  const drinkware = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: "Drinkware",
      slug: "drinkware",
      description: "Cups, mugs, and sake sets",
    },
  });
  const homedecor = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: "Home Decor",
      slug: "home-decor",
      description: "Vases, sculptures, and decorative pieces",
    },
  });
  const ritualobjects = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: "Ritual Objects",
      slug: "ritual-objects",
      description: "Incense holders and ceremonial items",
    },
  });
  const seasonal = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: "Seasonal",
      slug: "seasonal",
      description: "Limited edition seasonal collections",
    },
  });

  // Create Products
  console.log("🎨 Creating products...");

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Basho Hand-Glazed Oatmeal Pasta Bowl",
        slug: "basho-hand-glazed-oatmeal-pasta-bowl",
        description: "A versatile, wide-rimmed deep plate perfect for pasta, salads, or stews. Featuring a subtle, speckled oatmeal glaze and a smooth matte finish, these bowls are designed for both everyday dining and special gatherings.",
        price: 950.00,
        originalPrice: 1100.00,
        stock: 24,
        images: ["/images/products/4.jpg"],
        categoryId: dinnerware.id, // Dinnerware
        color: "Oatmeal / Sand",
        material: "Stoneware",
        dimensions: "9 inches diameter, 1.5 inches deep",
        weight: 0.7,
        inStock: true,
        isFeatured: false,
        isNew: true,
        isBestseller: true,
        care: "Microwave and Dishwasher safe. Use mild detergents.",
        features: [
          "Stackable nested design for easy storage",
          "Ergonomic wide-rim silhouette",
          "Durable high-fire stoneware body",
          "Sustainably handcrafted"
        ],
        metaTitle: "Artisanal Ceramic Pasta Bowl - Oatmeal Finish | Basho by Shivangi",
        metaDescription: "Discover the Basho Oatmeal Pasta Bowl. Hand-glazed stoneware with a minimalist aesthetic, perfect for modern tablescapes.",
        leadTime: "2-4 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Basho Organic Moss Green Shallow Bowl",
        slug: "basho-organic-moss-green-shallow-bowl",
        description: "A masterfully handcrafted shallow ceramic bowl featuring an organic, undulating rim. The interior is finished with a speckled moss-green matte glaze, while the exterior showcases the raw, earthy texture of terracotta stoneware.",
        price: 1850.00,
        originalPrice: 2200.00,
        stock: 12,
        images: ["/images/products/1.jpg", "/images/products/2.jpg"],
        categoryId: dinnerware.id,
        color: "Moss Green & Terracotta",
        material: "Hand-thrown Stoneware",
        dimensions: "Approx. 10 inches diameter, 2 inches height",
        weight: 0.85,
        inStock: true,
        isFeatured: true,
        isNew: true,
        care: "Food safe. Hand wash with mild soap recommended.",
        features: [
          "Individually hand-thrown",
          "Signature organic 'wavy' rim",
          "Dual-texture finish"
        ],
        metaTitle: "Handmade Moss Green Ceramic Bowl | Basho by Shivangi",
        metaDescription: "Elevate your dining with the Basho organic shallow bowl. Handcrafted stoneware featuring a unique green glaze."
      }
    }),
    prisma.product.create({
      data: {
        name: "Organic Ginkgo Serving Platter",
        slug: "organic-ginkgo-serving-platter",
        description: "A stunning, hand-sculpted serving platter inspired by the gentle curves of a ginkgo leaf. Its organic undulations create natural sections, making it perfect for arranging crackers, fruits, and cheeses for a grazing board. Finished in a soft, speckled white glaze.",
        price: 68.00,
        stock: 15,
        images: ["/images/products/IMG_6842.jpg"],
        // Category: Dinnerware
        categoryId: dinnerware.id,
        care: "Hand wash recommended to preserve the organic edges. Microwave safe.",
        color: "Speckled White",
        dimensions: "35cm x 28cm",
        features: [
          "Organic leaf-inspired shape",
          "Natural dividers for food separation",
          "Smooth speckled glaze",
          "Ideal for charcuterie and grazing"
        ],
        inStock: true,
        isBestseller: false,
        isFeatured: true,
        isNew: true,
        leadTime: "3-5 business days",
        material: "Stoneware clay",
        metaDescription: "Elevate your hosting with the Organic Ginkgo Serving Platter. A white ceramic grazing board perfect for appetizers and cheese pairings.",
        metaTitle: "Organic Ginkgo Serving Platter - Ceramic Charcuterie Board",
        weight: 1.2,
      },
    }),
    prisma.product.create({
      data: {
        name: "Basho Fluted Accent Bowl",
        slug: "basho-fluted-accent-bowl",
        description: "These hand-thrown bowls feature a tactile fluted exterior that fits perfectly in the hand. Glazed in harmonious two-tone palettes reminiscent of earth and sky—rusts, moss greens, teals, and soft pinks. The unglazed foot reveals the raw stoneware clay and bears the signature 'basho' stamp.",
        price: 28.00,
        stock: 24,
        images: ["/images/products/IMG_6843.jpg"],
        // Category: Dinnerware
        categoryId: dinnerware.id,
        care: "Dishwasher and microwave safe.",
        color: "Assorted Earth Tones (Two-Tone)",
        dimensions: "12cm diameter x 5cm height",
        features: [
          "Textured fluted exterior",
          "Artistic two-tone glaze application",
          "Stamped 'basho' logo on base",
          "Versatile size for sides or tea"
        ],
        inStock: true,
        isBestseller: false,
        isFeatured: false,
        isNew: true,
        leadTime: "2-4 business days",
        material: "Stoneware",
        metaDescription: "Discover the Basho Fluted Accent Bowl. Hand-thrown ceramic bowls with unique two-tone glazes and a tactile ribbed texture.",
        metaTitle: "Basho Fluted Accent Bowl | Handcrafted Ceramic Bowls",
        weight: 0.35,
      },
    }),
    prisma.product.create({
      data: {
        name: "Wildflower Meadow Mug",
        slug: "wildflower-meadow-mug",
        description: "Bring the garden inside. These sweet mugs feature a soft grey glaze serving as a canvas for hand-painted wildflowers in fresh greens and pops of red. A delicate and cheerful vessel for your morning tea or coffee.",
        price: 38.00,
        stock: 12,
        images: ["/images/products/IMG_6844.jpg"],
        // Category: Drinkware
        categoryId: dinnerware.id,
        care: "Hand wash recommended to preserve painting details.",
        color: "Soft Grey with Green/Red",
        dimensions: "300ml capacity",
        features: [
          "Hand-painted floral design",
          "Soft satin finish",
          "Delicate handle",
          "Whimsical aesthetic"
        ],
        inStock: true,
        material: "Stoneware",
        metaTitle: "Hand-Painted Wildflower Ceramic Mug",
        weight: 0.4,
      },
    }),
    prisma.product.create({
      data: {
        name: "Geometric Teal Mug",
        slug: "geometric-teal-mug",
        description: "Modern design meets rustic texture. This mug features a matte teal glaze intersected by raw, unglazed geometric lines that create a striking visual contrast. The sturdy handle and thick walls keep your beverage warm while offering a comfortable grip.",
        price: 35.00,
        stock: 18,
        images: ["/images/products/IMG_6845.jpg"],
        // Category: Drinkware
        categoryId: drinkware.id,
        care: "Microwave and dishwasher safe.",
        color: "Teal and Beige",
        dimensions: "350ml capacity",
        features: [
          "Wax-resist geometric patterns",
          "Matte teal finish",
          "Ergonomic handle",
          "Sturdy stoneware body"
        ],
        inStock: true,
        material: "Stoneware",
        metaTitle: "Geometric Teal Ceramic Mug",
        weight: 0.45,
      },
    }),
    prisma.product.create({
      data: {
        name: "Indigo Storm Mug",
        slug: "indigo-storm-mug",
        description: "Dive into the deep blue with the Indigo Storm Mug. The complex, layered glaze creates a unique mottled effect, reminiscent of ocean currents or a night sky. Each mug is unique, with slight variations in the blue tones.",
        price: 35.00,
        stock: 15,
        images: ["/images/products/IMG_6846.jpg"],
        // Category: Drinkware
        categoryId: drinkware.id,
        care: "Microwave and dishwasher safe.",
        color: "Deep Indigo Blue",
        dimensions: "350ml capacity",
        features: [
          "Rich, multi-layered glaze",
          "Unique textural variations",
          "Classic cylindrical shape",
          "Comfortable loop handle"
        ],
        inStock: true,
        material: "Stoneware",
        metaTitle: "Indigo Blue Handmade Ceramic Mug",
        weight: 0.45,
      },
    }),
    prisma.product.create({
      data: {
        name: "Artisan Ceramic Grater Plate",
        slug: "artisan-ceramic-grater-plate",
        description: "A functional masterpiece for your kitchen. This hand-thrown ceramic grater features a raised, textured center perfect for grating ginger, garlic, nutmeg, or hard cheeses directly into the dish. Finished with a convenient pouring spout and a warm, earthy brown glaze.",
        price: 32.00,
        stock: 20,
        images: ["/images/products/IMG_6847.jpg"],
        // Category: Dinnerware
        categoryId: dinnerware.id,
        care: "Dishwasher safe. Use a small brush to clean the grating teeth.",
        color: "Earth Brown",
        dimensions: "14cm diameter",
        features: [
          "Sharp, durable ceramic grating teeth",
          "Integrated pouring spout",
          "Hand-thrown craftsmanship",
          "Ideal for ginger, garlic, and wasabi"
        ],
        inStock: true,
        isBestseller: true,
        isFeatured: false,
        isNew: true,
        material: "Stoneware",
        metaTitle: "Ceramic Ginger & Garlic Grater Plate",
        weight: 0.4,
      },
    }),
    prisma.product.create({
      data: {
        name: "Assorted Ocean Dip Bowl",
        slug: "assorted-ocean-dip-bowl",
        description: "These jewel-like small bowls are perfect for soy sauce, dips, olives, or mise en place. Available in a variety of glazes inspired by the sea shore—deep lagoon blues, seafoam greens, and sandy browns. Each one is a unique discovery.",
        price: 18.00,
        stock: 30,
        images: ["/images/products/IMG_6849.jpg"],
        // Category: Dinnerware
        categoryId: dinnerware.id,
        care: "Dishwasher safe.",
        color: "Assorted (Blue, Green, Brown)",
        dimensions: "8cm diameter",
        features: [
          "Versatile small size",
          "Varied artistic glazes",
          "Organic rim shape",
          "Stackable design"
        ],
        inStock: true,
        material: "Stoneware",
        metaTitle: "Small Ceramic Dip and Sauce Bowls",
        weight: 0.15,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sculpted Offering Hand Dish",
        slug: "sculpted-offering-hand-dish",
        description: "A symbol of giving and receiving. These sculpted dishes are shaped like cupped hands, perfect for holding crystals, jewelry, sage bundles, or simply standing alone as a piece of art. Available in four distinct glaze finishes.",
        price: 45.00,
        stock: 8,
        images: ["/images/products/IMG_6850.jpg"],
        // Category: Home Decor
        categoryId: homedecor.id,
        care: "Wipe clean with a damp cloth.",
        color: "Assorted (White, Brown, Pink)",
        dimensions: "12cm x 10cm",
        features: [
          "Sculptural hand shape",
          "Intricate finger details",
          "Available in multiple finishes",
          "Ideal for trinkets or ritual objects"
        ],
        inStock: true,
        isFeatured: true,
        material: "Stoneware",
        metaTitle: "Ceramic Hand Shaped Trinket Dish",
        weight: 0.3,
      },
    }),
    prisma.product.create({
      data: {
        name: "Terra Gold Serving Bowl",
        slug: "terra-gold-serving-bowl",
        description: "A study in contrasts. This serving bowl features a raw, textured terracotta exterior that feels grounded and rustic, paired with a vibrant golden-mustard interior glaze that creates a warm glow. Perfect for serving salads, fruits, or pasta.",
        price: 55.00,
        stock: 8,
        images: ["/images/products/IMG_6873.jpg"],
        // Category: Dinnerware
        categoryId: dinnerware.id,
        care: "Hand wash recommended due to raw exterior.",
        color: "Terracotta and Golden Yellow",
        dimensions: "24cm diameter",
        features: [
          "Raw textured exterior",
          "Vibrant smooth interior glaze",
          "Wide shallow shape",
          "Statement serving piece"
        ],
        inStock: true,
        material: "Stoneware",
        metaTitle: "Rustic Terracotta and Gold Ceramic Bowl",
        weight: 0.8,
      },
    }),
    prisma.product.create({
      data: {
        name: "Pastel Horizon Oval Plate",
        slug: "pastel-horizon-oval-plate",
        description: "Soft, dreamy hues define these oval plates. Featuring a two-tone glaze application that mimics a horizon line, these plates are available in Mint/Pink and Earth/Mint combinations. Their unique egg shape adds a contemporary touch to any table setting.",
        price: 42.00,
        stock: 24,
        images: ["/images/products/IMG_6874.jpg"],
        // Category: Dinnerware
        categoryId: dinnerware.id,
        care: "Dishwasher safe. Stack carefully.",
        color: "Mint/Pink & Earth/Mint",
        dimensions: "26cm x 20cm",
        features: [
          "Unique oval/egg shape",
          "Soft matte two-tone glaze",
          "Perfect for breakfast or desserts",
          "Contemporary minimalist design"
        ],
        inStock: true,
        isNew: true,
        material: "Stoneware",
        metaTitle: "Pastel Two-Tone Oval Ceramic Plates",
        weight: 0.6,
      },
    }),
    prisma.product.create({
      data: {
        name: "Bird Finial Storage Jar",
        slug: "bird-finial-storage-jar",
        description: "Add a touch of whimsy to your kitchen with these charming storage jars. Each lid features a hand-sculpted bird finial. Glazed in soft, earthy gradients of pink, grey, and moss green, these jars are perfect for storing pickles, jams, sugar, or trinkets.",
        price: 48.00,
        stock: 10,
        images: ["/images/products/IMG_6875.jpg", "/images/products/IMG_6876.jpg", "/images/products/IMG_6880.jpg"],
        // Category: Dinnerware
        categoryId: dinnerware.id,
        care: "Hand wash recommended for the lid to protect the bird sculpture.",
        color: "Earthy Pink and Moss",
        dimensions: "12cm height x 10cm width",
        features: [
          "Hand-sculpted bird handle",
          "Airtight-style ceramic fit",
          "Soft gradient glaze",
          "Versatile storage or serving use"
        ],
        inStock: true,
        isFeatured: true,
        material: "Stoneware",
        metaTitle: "Ceramic Storage Jar with Bird Lid",
        weight: 0.55,
      },
    }),
    prisma.product.create({
      data: {
        name: "Hexagonal Pastel Serving Platters",
        slug: "hexagonal-pastel-serving-platters",
        description: "A playful collection of hexagonal plates featuring soft pastel glazes in blush pink, seafoam green, and earthy browns. The geometric shape adds a modern touch to fruit displays or dessert service.",
        price: 1200.00,
        stock: 12,
        images: ["/images/products/IMG_6877.jpg"],
        categoryId: dinnerware.id, // Dinnerware
        color: "Multicolor (Pink, Green, Brown)",
        material: "Ceramic",
        dimensions: "8 inches width",
        weight: 0.5,
        inStock: true,
        isNew: true,
        care: "Dishwasher safe.",
        features: [
          "Modern geometric hexagonal shape",
          "Soft matte pastel finishes",
          "Ideal for appetizers or desserts"
        ],
        metaTitle: "Hexagonal Ceramic Plates | Pastel Serving Ware",
        metaDescription: "Geometric hexagonal plates in soft pastel tones. Perfect for modern plating and serving fruits or desserts.",
        leadTime: "2-4 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Sparrow Bamboo Handle Tea Set",
        slug: "sparrow-bamboo-handle-tea-set",
        description: "An exquisite ceramic tea set featuring a teapot with a natural bamboo handle and a charming sculpted sparrow on the lid. Accompanied by matching cups, glazed in a soothing earthy taupe.",
        price: 3800.00,
        originalPrice: 4200.00,
        stock: 5,
        images: ["/images/products/IMG_6878.jpg", "/images/products/IMG_6879.jpg"],
        categoryId: teaware.id, // Tea Ware
        color: "Taupe / Grey",
        material: "Ceramic, Bamboo, Copper wire",
        dimensions: "Teapot: 600ml, Cups: 150ml",
        weight: 1.2,
        inStock: true,
        isFeatured: true,
        care: "Hand wash only due to bamboo handle. Do not microwave.",
        features: [
          "Hand-sculpted bird finial",
          "Natural bamboo handle attachment",
          "Drip-free spout design",
          "Includes teapot and two cups"
        ],
        metaTitle: "Japanese Style Tea Set with Bamboo Handle | Sparrow Collection",
        metaDescription: "A serene tea set with a bamboo handle and sparrow detail. Perfect for ritualistic tea brewing.",
        leadTime: "5-7 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Midnight & Slate Stoneware Tumblers",
        slug: "midnight-slate-stoneware-tumblers",
        description: "A set of handcrafted stoneware tumblers featuring deep midnight blue and slate grey glazes. These handle-less cups offer a minimalist silhouette, perfect for green tea, sake, or water.",
        price: 850.00,
        originalPrice: 950.00,
        stock: 15,
        images: ["/images/products/IMG_9334.jpg"],
        categoryId: drinkware.id, // Drinkware
        color: "Blue / Grey",
        material: "Stoneware",
        dimensions: "3 inches height, 3 inches diameter",
        weight: 0.3,
        inStock: true,
        isFeatured: false,
        isNew: true,
        care: "Dishwasher safe. Microwave safe.",
        features: [
          "Rich, glossy glaze finish",
          "Ergonomic handle-less design",
          "Heat-retentive stoneware body"
        ],
        metaTitle: "Blue & Grey Stoneware Tumblers | Handcrafted Drinkware",
        metaDescription: "Shop our Midnight & Slate tumblers. Minimalist ceramic cups glazed in deep blues and greys, perfect for tea or coffee.",
        leadTime: "2-3 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Forest Lid Minimalist Teapot",
        slug: "forest-lid-minimalist-teapot",
        description: "A compact, modern teapot defined by its clean white body and a contrasting deep forest green lid. Its round form and short spout make it ideal for brewing personal servings of loose-leaf tea.",
        price: 1800.00,
        stock: 8,
        images: ["/images/products/IMG_9336.jpg"],
        categoryId: teaware.id, // Tea Ware
        color: "White / Dark Green",
        material: "Porcelain",
        dimensions: "400ml capacity",
        weight: 0.5,
        inStock: true,
        care: "Dishwasher safe.",
        features: [
          "Contemporary two-tone design",
          "Smooth matte finish",
          "Built-in strainer holes at spout base"
        ],
        metaTitle: "Modern White & Green Teapot | Minimalist Tea Ware",
        metaDescription: "Brew in style with our Forest Lid Minimalist Teapot. A compact design for the modern tea lover.",
        leadTime: "2-4 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Sculpted Offering Hands Bowl",
        slug: "sculpted-offering-hands-bowl",
        description: "A poetic sculptural piece shaped as cupped hands. Available in pristine white and earthy brown, these bowls are perfect for holding ritual crystals, jewelry, or simply serving as a reminder of gratitude.",
        price: 1500.00,
        stock: 10,
        images: ["/images/products/IMG_9349.jpg"],
        categoryId: ritualobjects.id, // Ritual Objects
        color: "White / Brown",
        material: "Ceramic",
        dimensions: "6 inches length, 4 inches width",
        weight: 0.4,
        inStock: true,
        isNew: true,
        care: "Wipe clean with a damp cloth.",
        features: [
          "Anatomically inspired sculptural design",
          "Versatile use for decor or storage",
          "Hand-finished detailing"
        ],
        metaTitle: "Ceramic Hands Bowl | Ritual & Decor Object",
        metaDescription: "Sculpted ceramic hands for decor or ritual use. A unique piece symbolizing offering and gratitude.",
        leadTime: "3-5 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Earth & Cream Dual-Tone Plate",
        slug: "earth-cream-dual-tone-plate",
        description: "A striking ceramic plate defining the balance between raw nature and refined elegance. Half dipped in a smooth cream glaze, leaving the textured, sandy brown clay exposed on the other half.",
        price: 950.00,
        stock: 20,
        images: ["/images/products/IMG_9353.jpg", "/images/products/IMG_9351-2.jpg"],
        categoryId: dinnerware.id, // Dinnerware
        color: "Cream / Brown",
        material: "Stoneware",
        dimensions: "7.5 inches diameter",
        weight: 0.6,
        inStock: true,
        isFeatured: true,
        care: "Hand wash recommended to preserve raw clay texture.",
        features: [
          "Unique half-dipped glazing technique",
          "Exposed raw clay texture",
          "Organic, slightly irregular rim"
        ],
        metaTitle: "Rustic Dual-Tone Ceramic Plate | Earthy Dinnerware",
        metaDescription: "Hand-thrown ceramic plate featuring a raw clay and cream glaze contrast. A perfect rustic addition to your table setting.",
        leadTime: "3-5 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Rustic Dipped Clay Mugs",
        slug: "rustic-dipped-clay-mugs",
        description: "Sturdy stoneware mugs that celebrate the beauty of raw materials. The base is left unglazed to show the gritty, warm clay, while the top is dipped in a thick, creamy glaze.",
        price: 750.00,
        stock: 30,
        images: ["/images/products/IMG_9361.jpg"],
        categoryId: dinnerware.id, // Drinkware
        color: "Cream / Sand",
        material: "Stoneware",
        dimensions: "3.5 inches height, 300ml capacity",
        weight: 0.4,
        inStock: true,
        isBestseller: true,
        care: "Microwave and Dishwasher safe.",
        features: [
          "Tactile raw clay base",
          "Comfortable large handle",
          "Heavy-bottomed for stability"
        ],
        metaTitle: "Rustic Dipped Coffee Mugs | Handcrafted Stoneware",
        metaDescription: "Enjoy your morning brew in our Rustic Dipped Clay Mugs. Featuring exposed stoneware and a creamy glaze finish.",
        leadTime: "2-3 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Speckled Cream Espresso Mugs (Set of 2)",
        slug: "speckled-cream-espresso-mugs-set-2",
        description: "Minimalist espresso mugs featuring a soft cream speckled glaze and comfortable loop handles. These petite cups are designed for the perfect shot of coffee.",
        price: 850.00,
        stock: 30,
        images: ["/images/products/IMG_9371.jpg"],
        categoryId: drinkware.id, // Drinkware
        color: "Cream Speckled",
        material: "Ceramic",
        dimensions: "2.5 inches diameter, 2.5 inches height",
        weight: 0.4,
        inStock: true,
        care: "Dishwasher safe.",
        features: [
          "Ergonomic loop handle",
          "Minimalist speckled finish",
          "Perfect size for double espresso"
        ],
        metaTitle: "Speckled Cream Espresso Mugs | Artisan Coffee Ware",
        metaDescription: "Enjoy your morning brew in our Speckled Cream Espresso Mugs. Handcrafted for coffee lovers.",
        leadTime: "2-3 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Emerald Rim Tea Set",
        slug: "emerald-rim-ceramic-tea-set",
        description: "An elegant ceramic tea set including a teapot and two matching cups. The classic white body is sophisticatedly accented with deep emerald green rims and lids.",
        price: 2450.00,
        stock: 8,
        images: ["/images/products/IMG_9375.jpg"],
        categoryId: teaware.id, // Tea Ware
        color: "White / Emerald Green",
        material: "Porcelain",
        dimensions: "Teapot: 600ml, Cups: 150ml",
        weight: 1.5,
        inStock: true,
        isFeatured: true,
        care: "Hand wash recommended for longevity.",
        features: [
          "Complete set: 1 Teapot, 2 Cups",
          "Elegant dual-tone glaze",
          "Smooth pour spout"
        ],
        metaTitle: "Emerald Rim Tea Set | Handcrafted Tea Service",
        metaDescription: "Elevate your tea ritual with the Emerald Rim Tea Set. White ceramic with deep green accents.",
        leadTime: "4-6 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Ruffled Edge Cream Platter Set",
        slug: "ruffled-edge-cream-platter-set",
        description: "Elegantly crafted dinner plates with organic, ruffled edges and a soft cream glaze. The textured surface adds a tactile element to your dining experience, perfect for rustic or farmhouse aesthetics.",
        price: 2200.00,
        stock: 18,
        images: ["/images/products/IMG_9385-2.jpg"],
        categoryId: dinnerware.id, // Dinnerware
        color: "Cream / Off-White",
        material: "Ceramic",
        dimensions: "10.5 inches diameter",
        weight: 1.1,
        inStock: true,
        care: "Hand wash recommended to preserve edges.",
        features: [
          "Unique ruffled/wavy rim",
          "Textured matte finish",
          "Vintage farmhouse style"
        ],
        metaTitle: "Ruffled Edge Cream Dinner Plates | Basho Ceramics",
        metaDescription: "Shop our Ruffled Edge Cream Platter Set. Organic shapes meet elegant dining.",
        leadTime: "3-4 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Earth & Cloud Serving Duo",
        slug: "earth-cloud-serving-bowl-plate-duo",
        description: "A rustic serving combination featuring a large flat plate and a matching deep bowl. The earthy brown base is contrasted by a sweeping cream glaze, resembling clouds over a landscape.",
        price: 2100.00,
        stock: 12,
        images: ["/images/products/IMG_9389.jpg"],
        categoryId: dinnerware.id, // Dinnerware
        color: "Brown / Cream",
        material: "Stoneware",
        dimensions: "Plate: 11 inches, Bowl: 6 inches",
        weight: 1.4,
        inStock: true,
        care: "Microwave and Dishwasher safe.",
        features: [
          "Versatile serving options",
          "Heavy-weight durable stoneware",
          "Unique hand-dipped pattern"
        ],
        metaTitle: "Earth & Cloud Serving Bowl & Plate | Rustic Dinnerware",
        metaDescription: "Serve in style with the Earth & Cloud Serving Duo. Handcrafted ceramic bowl and plate set.",
        leadTime: "3-5 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Cloudscape Ceramic Plate Set",
        slug: "cloudscape-ceramic-plate-set-brown-cream",
        description: "A stunning set of two handcrafted stoneware plates featuring a warm earthy brown glaze contrasted with organic, cream-colored cloud patterns. Perfect for serving main courses and sides with a rustic touch.",
        price: 1850.00,
        stock: 15,
        images: ["/images/products/IMG_9391.jpg"],
        categoryId: dinnerware.id, // Dinnerware
        color: "Brown / Cream",
        material: "Stoneware",
        dimensions: "Large: 10 inches, Small: 7 inches",
        weight: 1.2,
        inStock: true,
        isFeatured: true,
        care: "Microwave and Dishwasher safe.",
        features: [
          "Organic hand-poured glaze pattern",
          "Durable stoneware body",
          "Set of two distinct sizes"
        ],
        metaTitle: "Cloudscape Brown & Cream Ceramic Plates | Basho",
        metaDescription: "Shop the Cloudscape Ceramic Plate Set. Hand-glazed stoneware with an earthy aesthetic.",
        leadTime: "3-5 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "Ceramic Fortune Cookie Keepsakes (Set of 4)",
        slug: "ceramic-fortune-cookie-keepsakes",
        description: "Whimsical ceramic fortune cookies designed to hold personalized notes, affirmations, or wishes. A perfect mindfulness tool or a thoughtful gift for a loved one. Each cookie features a 'Dear Me' inscription.",
        price: 1200.00,
        stock: 25,
        images: ["/images/products/IMG_9403.jpg"],
        categoryId: ritualobjects.id, // Ritual Objects
        color: "Assorted Glazes",
        material: "Ceramic",
        dimensions: "2.5 inches width each",
        weight: 0.3,
        inStock: true,
        isNew: true,
        care: "Wipe clean with a damp cloth.",
        features: [
          "Interactive ceramic art",
          "Space for paper notes inside",
          "Hand-painted lettering"
        ],
        metaTitle: "Ceramic Fortune Cookies | Mindfulness Ritual Objects",
        metaDescription: "Discover our Ceramic Fortune Cookie Keepsakes. Store your wishes and affirmations in style.",
        leadTime: "2-3 business days"
      }
    }),
    prisma.product.create({
      data: {
        name: "The Complete Earth Tones Breakfast Set",
        slug: "complete-earth-tones-breakfast-set",
        description: "Start your day with art. This complete breakfast collection includes two plates, two mugs, and a pitcher, all united by the signature earth and cream glaze design.",
        price: 4800.00,
        originalPrice: 5200.00,
        stock: 5,
        images: ["/images/products/IMG_9411.jpg"],
        categoryId: dinnerware.id, // Dinnerware
        color: "Brown / Cream",
        material: "Stoneware",
        dimensions: "Various sizes",
        weight: 2.8,
        inStock: true,
        isBestseller: true,
        care: "Dishwasher safe.",
        features: [
          "Comprehensive 5-piece set",
          "Cohesive aesthetic for your table",
          "Perfect gift for new homes"
        ],
        metaTitle: "Earth Tones Breakfast Set | Full Ceramic Collection",
        metaDescription: "The ultimate breakfast set featuring plates, mugs, and a pitcher in our signature Earth & Cloud glaze.",
        leadTime: "5-7 business days"
      }
    })
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

  const categories = [teaware, dinnerware, drinkware, homedecor, ritualobjects, seasonal];

  // Display summary
  console.log("\n📊 Summary:");
  console.log(`   Users: ${users.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Reviews: ${reviews.length}`);

  return;
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