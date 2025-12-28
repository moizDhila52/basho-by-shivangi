import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ cartItems: [] });
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        CartItem: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                images: true,
                inStock: true,
                stock: true,
                Category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      // Create cart if it doesn't exist
      cart = await prisma.cart.create({
        data: {
          id: `cart_${session.userId}`,
          userId: session.userId,
        },
        include: {
          CartItem: {
            include: {
              Product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  originalPrice: true,
                  images: true,
                  inStock: true,
                  stock: true,
                  Category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Transform cart items to match frontend format
    const cartItems = cart.CartItem.map((item) => ({
      id: item.Product.id,
      name: item.Product.name,
      slug: item.Product.slug,
      price: item.Product.price,
      originalPrice: item.Product.originalPrice,
      image: item.Product.images?.[0] || "/placeholder-image.jpg",
      inStock: item.Product.inStock,
      stock: item.Product.stock,
      category: item.Product.Category?.name,
      quantity: item.quantity,
      cartItemId: item.id,
    }));

    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
