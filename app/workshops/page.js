import { prisma } from "@/lib/db";
import WorkshopFeed from "@/components/workshops/WorkshopFeed"; // We will create this below

export const metadata = {
  title: "Pottery Workshops | Basho",
  description: "Join our hands-on pottery workshops in Surat.",
};

// Server Component: Fetches Data
export default async function WorkshopsPage() {
  const workshops = await prisma.workshop.findMany({
    where: { status: "ACTIVE" },
    include: {
      WorkshopSession: {
        where: { date: { gte: new Date() } }, // Only future sessions
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
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

      {/* Interactive Feed */}
      <WorkshopFeed initialWorkshops={workshops} />
    </main>
  );
}
