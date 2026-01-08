import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { categoryNames, excludeIds } = await request.json();

    // 1. Find products in the same categories
    let recommendations = await prisma.product.findMany({
      where: {
        AND: [
          { inStock: true },
          { id: { notIn: excludeIds } },
          {
            Category: {
              name: { in: categoryNames },
            },
          },
        ],
      },
      take: 3,
      include: {
        Category: true,
        // images: true,  <--- REMOVE THIS LINE
      },
    });

    // 2. Fallback logic
    if (recommendations.length < 3) {
      const needed = 3 - recommendations.length;
      const fallbackIds = [...excludeIds, ...recommendations.map((p) => p.id)];

      const fallbacks = await prisma.product.findMany({
        where: {
          AND: [{ inStock: true }, { id: { notIn: fallbackIds } }],
        },
        take: needed,
        orderBy: { createdAt: 'desc' },
        include: {
          Category: true,
         
        },
      });

      recommendations = [...recommendations, ...fallbacks];
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendation Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
