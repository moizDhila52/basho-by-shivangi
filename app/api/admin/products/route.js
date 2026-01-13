import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Standardized to @/lib/prisma
import { sendCampaignEmail } from "@/lib/mailer"; // <--- IMPORT THIS

// Helper to create slugs
const createSlug = (name) => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Date.now().toString().slice(-4)
  );
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const where = {};
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        Category: true,
        _count: { select: { OrderItem: true } },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Destructure and validate required fields
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      images,
      material,
      features,
      dimensions,
      color,
      care,
      leadTime,
      isFeatured,
      isBestseller,
      isNew,
      originalPrice,
      metaTitle,
      metaDescription,
      sendNewsletter, // <--- EXTRACT FLAG
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Product in DB
    const product = await prisma.product.create({
      data: {
        name,
        slug: createSlug(name),
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: images || [], 
        categoryId,
        material,
        features: features || [],
        dimensions,
        color,
        care,
        leadTime,
        isFeatured: isFeatured || false,
        isBestseller: isBestseller || false,
        isNew: isNew || false,
        inStock: parseInt(stock) > 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        metaTitle,
        metaDescription,
      },
    });

    // --- NEW LOGIC: SEND NEWSLETTER IF CHECKED ---
    if (sendNewsletter) {
      try {
        // 1. Fetch Subscribers (Users + Guest Subscribers)
        const [users, guestSubscribers] = await Promise.all([
          prisma.user.findMany({ where: { isSubscribed: true }, select: { email: true } }),
          prisma.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } })
        ]);

        const allEmails = [...new Set([
          ...users.map(u => u.email),
          ...guestSubscribers.map(s => s.email)
        ])];

        if (allEmails.length > 0) {
          // 2. Send Campaign
          const result = await sendCampaignEmail(allEmails, {
            type: 'PRODUCT',
            item: product,
            customSubject: `New Arrival: ${product.name}`,
            customMessage: product.description.substring(0, 150) + "..."
          });

          // 3. Log History
          await prisma.newsletterCampaign.create({
            data: {
              subject: result.subject,
              type: 'PRODUCT',
              referenceId: product.id,
              recipientCount: result.count,
              status: 'SENT'
            }
          });
        }
      } catch (mailError) {
        console.error("Failed to send newsletter trigger:", mailError);
        // We do not fail the request if mail fails, just log it
      }
    }
    // ---------------------------------------------

    return NextResponse.json(product);
  } catch (error) {
    console.error("CREATE Product Error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}