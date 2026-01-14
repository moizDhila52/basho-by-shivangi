import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { triggerNotification } from '@/lib/socketTrigger';
import { sendRestockEmail, sendCampaignEmail } from '@/lib/mailer'; // <--- IMPORT sendCampaignEmail

// PUT: Update a product
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Strip out fields that cannot be updated directly
    // --- IMPORTANT: Extract sendNewsletter here to remove it from updateData ---
    const {
      id: _id,
      createdAt,
      updatedAt,
      Category,
      _count,
      sendNewsletter, // <--- EXTRACT FLAG
      ...updateData
    } = body;

    // 1. Fetch EXISTING product first
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
        price: parseFloat(updateData.price),
        stock: newStock,
        originalPrice: updateData.originalPrice
          ? parseFloat(updateData.originalPrice)
          : null,
        inStock: newStock > 0,
      },
    });

    // 3. CHECK FOR RESTOCK EVENT (Existing Logic)
    if (oldStock === 0 && newStock > 0) {
      const waitlist = await prisma.productWaitlist.findMany({
        where: { productId: id },
      });

      for (const entry of waitlist) {
        if (entry.userId) {
          await prisma.notification.create({
            data: {
              userId: entry.userId,
              title: 'Back in Stock!',
              message: `The product "${product.name}" you wanted is available again.`,
              type: 'PRODUCT',
              link: `/products/${product.slug}`,
            },
          });
          await triggerNotification(entry.userId, 'notification', {
            title: 'Back in Stock!',
            message: `Your item "${product.name}" is back!`,
          });
        }
        try {
           await sendRestockEmail(entry.email, product);
        } catch (e) {
          console.error('Restock email failed', e);
        }
      }
      await prisma.productWaitlist.deleteMany({
        where: { productId: id },
      });
    }

    // 4. --- NEW LOGIC: SEND NEWSLETTER IF CHECKED (General Blast) ---
    if (sendNewsletter) {
      try {
        const [users, guestSubscribers] = await Promise.all([
          prisma.user.findMany({ where: { isSubscribed: true }, select: { email: true } }),
          prisma.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } })
        ]);

        const allEmails = [...new Set([
          ...users.map(u => u.email),
          ...guestSubscribers.map(s => s.email)
        ])];

        if (allEmails.length > 0) {
          const result = await sendCampaignEmail(allEmails, {
            type: 'PRODUCT',
            item: product,
            // Customize subject slightly for updates (e.g. Back in Stock or Updated)
            customSubject: oldStock === 0 && newStock > 0 ? `Back in Stock: ${product.name}` : `Check out: ${product.name}`,
            customMessage: product.description.substring(0, 150) + "..."
          });

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
        console.error("Failed to send newsletter update:", mailError);
      }
    }
    // -------------------------------------------------------------

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