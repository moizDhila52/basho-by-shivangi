import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import WorkshopDetailClient from '@/components/workshops/WorkshopDetailClient';

export const dynamic = 'force-dynamic';

export default async function WorkshopDetailPage({ params }) {
  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      WorkshopSession: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!workshop) return notFound();

  // Pass data to the Client Component
  // Added responsive padding wrapper directly here for safety
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-24 md:pb-0">
      <WorkshopDetailClient workshop={workshop} />
    </div>
  );
}
