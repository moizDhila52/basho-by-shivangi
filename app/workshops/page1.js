import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Clock, Users, ArrowRight } from "lucide-react";

// 1. Fetch Workshops (Server Side)
async function getWorkshops() {
  return await prisma.workshop.findMany({
    where: { status: "ACTIVE" },
    include: { sessions: true }, // Include dates to show availability
  });
}

export const metadata = {
  title: "Pottery Workshops | Basho",
  description: "Join our hands-on pottery workshops in Surat.",
};

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-basho-earth text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">
            The Studio Sessions
          </h1>
          <p className="text-basho-sand text-lg max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in the tactile art of ceramics. Our workshops are
            designed to slow down time and reconnect your hands with the earth.
          </p>
        </div>
      </div>

      {/* WORKSHOP GRID */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {workshops.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-serif text-stone-400">
              No workshops scheduled right now.
            </h3>
            <p className="text-stone-500 mt-2">
              Check back soon for new dates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {workshops.map((workshop) => (
              <Link
                key={workshop.id}
                href={`/workshops/${workshop.id}`} // Links to the detail page
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={workshop.image}
                    alt={workshop.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-stone-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {workshop.level}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-2xl font-bold text-stone-800 group-hover:text-basho-earth transition-colors">
                      {workshop.title}
                    </h3>
                    <span className="font-medium text-stone-900 bg-stone-100 px-3 py-1 rounded-lg">
                      ₹{workshop.price}
                    </span>
                  </div>

                  <p className="text-stone-500 line-clamp-2 mb-6">
                    {workshop.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-stone-400 mb-8">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{workshop.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>Max {workshop.maxStudents}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-basho-earth font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
                    VIEW DETAILS <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
