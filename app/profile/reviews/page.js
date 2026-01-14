import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ReviewGallery from '@/components/ReviewGallery'; // 👈 Import the component

// Nuclear Cache Busting
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MyReviewsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch reviews with Product Data
  const reviews = await prisma.review.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      Product: {
        select: {
          name: true,
          slug: true,
          images: true, // Needed for the thumbnail in the lightbox
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif text-[#442D1C] mb-2">My Reviews</h1>
          <p className="text-stone-500">
            A gallery of the pieces you've collected and reviewed.
          </p>
        </div>

        {/* The Client Grid Component */}
        <ReviewGallery reviews={reviews} />
        
      </div>
    </div>
  );
}