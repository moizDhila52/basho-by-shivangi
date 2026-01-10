import { prisma } from '@/lib/prisma'; // Ensure this matches your actual db import path
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, MapPin, Globe } from 'lucide-react';
import BookingWidget from '@/components/workshops/BookingWidget';

// Force dynamic because availability changes
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

  return (
    <div className="bg-[#FDFBF7] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT COL: Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header Image */}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={workshop.image || '/placeholder.jpg'}
              alt={workshop.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider text-[#442D1C]">
              {workshop.level}
            </div>
          </div>

          {/* Title & Stats */}
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#442D1C] mb-6 leading-tight">
              {workshop.title}
            </h1>

            <div className="flex flex-wrap gap-6 p-6 bg-white rounded-2xl border border-[#EDD8B4]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDFBF7] rounded-full text-[#C85428]">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#8E5022] uppercase font-bold">
                    Duration
                  </p>
                  <p className="text-[#442D1C] font-medium">
                    {workshop.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDFBF7] rounded-full text-[#C85428]">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#8E5022] uppercase font-bold">
                    Class Size
                  </p>
                  <p className="text-[#442D1C] font-medium">
                    Max {workshop.maxStudents}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDFBF7] rounded-full text-[#C85428]">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#8E5022] uppercase font-bold">
                    Language
                  </p>
                  <p className="text-[#442D1C] font-medium">
                    {workshop.language}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-stone prose-lg max-w-none text-[#652810]/80">
            <h3 className="font-serif text-[#442D1C]">About the Workshop</h3>
            <p className="whitespace-pre-wrap">{workshop.description}</p>
          </div>

          {/* Instructor */}
          <div className="bg-[#442D1C] text-[#EDD8B4] p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <Image
                src={workshop.instructorImage || '/placeholder-user.jpg'}
                alt={workshop.instructorName}
                fill
                className="object-cover rounded-full border-4 border-[#EDD8B4]/20"
              />
            </div>
            <div>
              <p className="text-[#C85428] font-bold tracking-widest text-xs uppercase mb-2">
                Your Instructor
              </p>
              <h3 className="font-serif text-2xl text-white mb-2">
                {workshop.instructorName}
              </h3>
              <p className="text-[#EDD8B4]/60 text-sm mb-4">
                {workshop.instructorRole}
              </p>
              <p className="text-[#EDD8B4]/80 leading-relaxed italic">
                "{workshop.instructorBio}"
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          {workshop.gallery && workshop.gallery.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                Student Work
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {workshop.gallery.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {/* The logic for 'You're Going!' and 'Sold Out' is handled inside this widget */}
            <BookingWidget
              workshopId={workshop.id}
              price={workshop.price}
              title={workshop.title}
              sessions={workshop.WorkshopSession}
            />

            <div className="mt-6 flex items-start gap-3 p-4 bg-[#EDD8B4]/20 rounded-xl border border-[#EDD8B4]">
              <MapPin className="text-[#C85428] flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-[#442D1C] text-sm">Location</p>
                <p className="text-[#8E5022] text-sm mt-1">
                  {workshop.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
