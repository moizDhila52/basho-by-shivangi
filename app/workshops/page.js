import { prisma } from '@/lib/prisma'; // Make sure path is correct
import WorkshopFeed from '@/components/workshops/WorkshopFeed';

export const metadata = {
  title: 'Pottery Workshops | Basho',
  description: 'Join our hands-on pottery workshops in Surat.',
};

// Server Component: Fetches Data
export default async function WorkshopsPage() {
  const today = new Date();

  // 1. Fetch Active/Upcoming Workshops
  const activeWorkshops = await prisma.workshop.findMany({
    where: {
      status: 'ACTIVE',
      // Logic: Only show workshops that have at least one future session
      WorkshopSession: {
        some: { date: { gte: today } },
      },
    },
    include: {
      WorkshopSession: {
        where: { date: { gte: today } }, // Only fetch future sessions for display
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Fetch Past Workshops (For "Previous Editions" section)
  // Logic: Workshops that are COMPLETED or have no future sessions
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
    take: 3, // Limit to 3 recent past workshops
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-[#442D1C] text-[#EDD8B4]">
        <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-[#C85428] font-bold tracking-widest text-xs uppercase mb-4 block">
            The Studio Sessions
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-[#EDD8B4] mb-6 leading-tight">
            Connect with <span className="italic text-[#C85428]">Clay</span>
          </h1>
          <p className="text-xl text-[#EDD8B4]/80 max-w-2xl mx-auto font-light">
            Immerse yourself in the tactile art of ceramics. Our workshops are
            designed to slow down time and reconnect your hands with the earth.
          </p>
        </div>
      </section>

      {/* Interactive Feed (Active Workshops) */}
      <WorkshopFeed
        initialWorkshops={activeWorkshops}
        pastWorkshops={pastWorkshops}
      />
    </main>
  );
}
