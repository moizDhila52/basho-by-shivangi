'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, ArrowRight, Hammer, Flame, Palette } from 'lucide-react';

// --- ANIMATIONS ---
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function MeetTheArtisansPage() {
  // Mock Data for Team
  const team = [
    {
      name: 'Shivangi',
      role: 'Founder & Head Potter',
      bio: 'The soul of Basho. Specializes in wheel-thrown forms and experimental glazing techniques.',
      image: 'brand/founder.jpg', // Placeholder
      specialty: 'Wheel Throwing',
      icon: <Hammer className="w-4 h-4" />,
    },
    {
      name: 'Arjun',
      role: 'Kiln Master',
      bio: 'The guardian of fire. Arjun manages the complex firing schedules that give our Raku pieces their unique finish.',
      image:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop', // Placeholder
      specialty: 'Firing & Glazing',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      name: 'Meera',
      role: 'Hand-building Artist',
      bio: 'Bringing organic shapes to life. Meera crafts our slab-built platters and pinch-pot mugs.',
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', // Placeholder
      specialty: 'Hand Building',
      icon: <Palette className="w-4 h-4" />,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#442D1C] font-sans selection:bg-[#C85428] selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              The Makers
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6">
              Hands Behind <br />{' '}
              <span className="text-[#C85428]">The Art</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Every piece of Basho pottery carries the fingerprint of its maker.
              Meet the artisans who transform raw earth into timeless objects.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- TEAM GRID --- */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                variants={itemAnim}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-100 hover:shadow-2xl transition-all duration-500"
              >
                {/* Image */}
                <div className="h-96 overflow-hidden bg-stone-200 relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#442D1C] via-transparent to-transparent opacity-80" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#FDFBF7]/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-[#8E5022] flex items-center gap-2">
                      {member.icon} {member.specialty}
                    </span>
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-serif text-3xl text-[#FDFBF7] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#EDD8B4] text-sm font-bold uppercase tracking-wider mb-4">
                    {member.role}
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- THE PROCESS (Visual Story) --- */}
      <section className="py-24 px-4 bg-[#EDD8B4]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="flex-1">
              <h2 className="font-serif text-4xl text-[#442D1C] mb-6">
                A Day in the Studio
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed">
                Our studio is a place of rhythmic chaos. From the slapping of
                clay in the morning to the quiet hum of the kiln at night, every
                sound contributes to the final piece. We believe in slow
                production—giving each bowl, cup, and vase the time it needs to
                find its form.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <button className="text-[#8E5022] font-bold border-b-2 border-[#8E5022] pb-1 hover:text-[#C85428] hover:border-[#C85428] transition-colors">
                Special Products
              </button>
            </div>
          </div>

          {/* Masonry-style Grid for Process */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
              <img
                src="showcase/products/7.png"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold text-[#442D1C]">
                Wedging Clay
              </div>
            </div>
            <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group">
              <img
                src="showcase/products/2.png"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden group">
              <img
                src="showcase/products/3.png"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold text-[#442D1C]">
                Trimming
              </div>
            </div>
            <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group">
              <img
                src="showcase/products/4.png"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- JOIN THE COMMUNITY --- */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Instagram className="w-12 h-12 text-[#C85428] mx-auto mb-6" />
          <h2 className="font-serif text-3xl mb-4 text-[#442D1C]">
            Join Our Community
          </h2>
          <p className="text-stone-600 mb-8">
            Follow our daily studio life, firing reveals, and behind-the-scenes
            moments on Instagram.
          </p>
          <a
            href="https://www.instagram.com/bashobyyshivangi/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#442D1C] text-[#EDD8B4] px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors inline-flex items-center gap-2"
          >
            @bashobyyshivangi <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
