import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { guestCart } = await request.json();

    if (!guestCart || !Array.isArray(guestCart) || guestCart.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No guest cart to merge",
      });
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          id: `cart_${session.userId}`,
          userId: session.userId,
        },
      });
    }

    // Merge guest cart items
    for (const guestItem of guestCart) {
      // Validate product exists and is in stock
      const product = await prisma.product.findUnique({
        where: { id: guestItem.id },
        select: { price: true, inStock: true, stock: true },
      });

      if (!product || !product.inStock) {
        continue; // Skip if product doesn't exist or is out of stock
      }

      // Check if item already exists in user's cart
      const existingCartItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: guestItem.id,
          },
        },
      });

      if (existingCartItem) {
        // Update quantity (but don't exceed stock)
        const newQuantity = Math.min(
          existingCartItem.quantity + guestItem.quantity,
          product.stock
        );

        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Create new cart item
        const quantity = Math.min(guestItem.quantity, product.stock);

        await prisma.cartItem.create({
          data: {
            id: `cartitem_${Date.now()}_${guestItem.id}`,
            cartId: cart.id,
            productId: guestItem.id,
            quantity: quantity,
            price: product.price,
          },
        });
      }
    }

    // Fetch merged cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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

    const cartItems = updatedCart.CartItem.map((item) => ({
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

    return NextResponse.json({
      success: true,
      cartItems,
      message: "Cart merged successfully",
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 }
    );
  }
}
