import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Get Top Selling Products
    const topSelling = await prisma.orderItem.groupBy({
      by: ['productId', 'productName', 'productImage'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 20, // <--- INCREASED LIMIT
    });

    // 2. Get Most Wishlisted
    const topWishlisted = await prisma.wishlistItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 20, // <--- INCREASED LIMIT
    });

    // 3. Get Most Carted
    const topCarted = await prisma.cartItem.groupBy({
      by: ['productId'],
      _count: { productId: true }, // Count unique carts
      orderBy: { _count: { productId: 'desc' } },
      take: 20, // <--- INCREASED LIMIT
    });

    // 4. Fetch Product Details
    const productIds = [
      ...topSelling.map(i => i.productId),
      ...topWishlisted.map(i => i.productId),
      ...topCarted.map(i => i.productId)
    ];

    const uniqueIds = [...new Set(productIds)];

    const products = await prisma.product.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, name: true, images: true, price: true }
    });

    // Helper to merge details
    const mergeDetails = (items, idKey, isSum = false) => {
      return items.map(item => {
        const product = products.find(p => p.id === item[idKey]);
        const qty = isSum ? (item._sum?.quantity || 0) : (item._count?.productId || 0);
        const price = product ? product.price : 0;

        return {
          name: product ? product.name : (item.productName || 'Unknown Product'),
          image: (product && product.images[0]) ? product.images[0] : (item.productImage || null),
          price: price,
          qty: qty,
          revenue: qty * price
        };
      });
    };

    // Format Data
    const formattedSales = topSelling.map(item => {
        const product = products.find(p => p.id === item.productId);
        const price = product ? product.price : 0;
        const qty = item._sum.quantity || 0;
        return {
            name: item.productName,
            image: item.productImage,
            qty: qty,
            revenue: qty * price
        };
    });

    const formattedWishlist = mergeDetails(topWishlisted, 'productId', false);
    const formattedCart = mergeDetails(topCarted, 'productId', false);

    return NextResponse.json({
      topProducts: formattedSales,
      mostWishlisted: formattedWishlist,
      mostCarted: formattedCart
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}