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

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
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
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.inStock || product.stock < quantity) {
      return NextResponse.json(
        { error: "Product is out of stock" },
        { status: 400 }
      );
    }

    // Find or create cart
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

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available` },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          id: `cartitem_${Date.now()}_${productId}`,
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
          price: product.price,
        },
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
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
