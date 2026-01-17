import { prisma } from '@/lib/prisma';
import WorkshopFeed from '@/components/workshops/WorkshopFeed';

export const metadata = {
  title: 'Pottery Workshops | Basho',
  description: 'Join our hands-on pottery workshops in Surat.',
};

// Force dynamic since dates change
export const dynamic = 'force-dynamic';

export default async function WorkshopsPage() {
  const today = new Date();

  // 1. Fetch Active/Upcoming Workshops
  const activeWorkshops = await prisma.workshop.findMany({
    where: {
      status: 'ACTIVE',
      WorkshopSession: {
        some: { date: { gte: today } },
      },
    },
    include: {
      WorkshopSession: {
        where: { date: { gte: today } },
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Fetch Past Workshops
  const pastWorkshops = await prisma.workshop.findMany({
    where: {
      OR: [
        { status: 'COMPLETED' },
        {
          status: 'ACTIVE',
          WorkshopSession: { none: { date: { gte: today } } },
        },
      ],
    },
    take: 3,
    orderBy: { updatedAt: 'desc' },
  });

  return (
    // 👇 UPDATED: Added responsive padding (pt-24, pb-24, px-4) to handle Header & Mobile Nav
    <main className="min-h-screen bg-[#FDFBF7] pt-24 pb-24 md:pb-12 px-4 md:px-8">
      <div className="max-w-[1920px] mx-auto">
        <WorkshopFeed
          initialWorkshops={activeWorkshops}
          pastWorkshops={pastWorkshops}
        />
      </div>
    </main>
  );
}
