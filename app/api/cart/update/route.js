import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    // Find cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // If quantity is 0 or less, delete the item
    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: productId,
        },
      });
    } else {
      // Validate stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true, inStock: true },
      });

      if (!product || !product.inStock || product.stock < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      // Update quantity
      await prisma.cartItem.updateMany({
        where: {
          cartId: cart.id,
          productId: productId,
        },
        data: { quantity: quantity },
      });
    }

    // Fetch updated cart
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
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}
