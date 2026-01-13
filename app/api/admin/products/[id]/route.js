import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Changed to @/lib/prisma to match your other files
import { triggerNotification } from '@/lib/socketTrigger';
import { sendRestockEmail } from '@/lib/mailer';

// PUT: Update a product
export async function PUT(req, { params }) {
  try {
    // --- FIX: Await params because it is a Promise in Next.js 15+ ---
    const { id } = await params;

    const body = await req.json();

    // Strip out fields that cannot be updated directly
    const {
      id: _id,
      createdAt,
      updatedAt,
      Category,
      _count,
      ...updateData
    } = body;

    // 1. Fetch EXISTING product first (Needed to check old stock level)
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const oldStock = existingProduct.stock;
    const newStock = parseInt(updateData.stock);

    // 2. Perform the Update
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        // Ensure numeric types
        price: parseFloat(updateData.price),
        stock: newStock,
        originalPrice: updateData.originalPrice
          ? parseFloat(updateData.originalPrice)
          : null,
        // Calculate boolean logic
        inStock: newStock > 0,
      },
    });

    // 3. CHECK FOR RESTOCK EVENT (Logic Added Here)
    if (oldStock === 0 && newStock > 0) {
      // A. Find everyone waiting for THIS product
      const waitlist = await prisma.productWaitlist.findMany({
        where: { productId: id },
      });

      // B. Loop through them and send alerts
      for (const entry of waitlist) {
        // Send Real-Time Notification (if they have a userId)
        if (entry.userId) {
          await prisma.notification.create({
            data: {
              userId: entry.userId,
              title: 'Back in Stock!',
              message: `The product "${product.name}" you wanted is available again. Grab it before it's gone!`,
              type: 'PRODUCT',
              link: `/products/${product.slug}`,
            },
          });

          await triggerNotification(entry.userId, 'notification', {
            title: 'Back in Stock!',
            message: `Your item "${product.name}" is back!`,
          });
        }

        // Send Email (To everyone, even guests)
        try {
          // Uncomment below when you have implemented the mailer function
          // await sendRestockEmail(entry.email, product);
        } catch (e) {
          console.error('Restock email failed', e);
        }
      }

      // C. Clear the waitlist
      await prisma.productWaitlist.deleteMany({
        where: { productId: id },
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('UPDATE Product Error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 },
    );
  }
}

// DELETE: Remove a product
export async function DELETE(req, { params }) {
  try {
    // --- FIX: Await params here as well ---
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DELETE Product Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}
