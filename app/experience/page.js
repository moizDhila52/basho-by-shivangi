'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Heart, 
  PartyPopper, 
  Clock, 
  MapPin,
  ArrowRight
} from 'lucide-react';

// Static Data with Pottery Images
const experiences = [
  {
    id: 'couple-date',
    title: 'Couple Pottery Date',
    description: 'A romantic, hands-on clay session for two. Create memories and mugs together on the wheel.',
    icon: <Heart className="w-5 h-5" />,
    // Image: Hands on pottery wheel
    image: 'https://images.unsplash.com/photo-1622158364766-993d07718041?q=80&w=2070&auto=format&fit=crop', 
    price: 'Custom pricing',
    duration: '2 Hours',
  },
  {
    id: 'birthday',
    title: 'Birthday Celebrations',
    description: 'Celebrate your special day with clay! Perfect for small groups, creative parties, and cake cutting.',
    icon: <PartyPopper className="w-5 h-5" />,
    // Image: Pottery pieces drying / Group vibe
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=2070&auto=format&fit=crop', 
    price: 'Custom pricing',
    duration: '3-4 Hours',
  },
  {
    id: 'garden-party',
    title: 'Farm & Garden Parties',
    description: 'An outdoor pottery experience amidst nature. Ideal for intimate gatherings and soothing vibes.',
    icon: <Users className="w-5 h-5" />,
    // Image: Outdoor / Earthy ceramics
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop', 
    price: 'Custom pricing',
    duration: 'Half Day',
  },
  {
    id: 'studio-visit',
    title: 'Studio Experience',
    description: 'A guided tour of our workspace followed by a mini hand-building session with our lead artist.',
    icon: <Calendar className="w-5 h-5" />,
    // Image: Pottery Studio Interior
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=2005&auto=format&fit=crop', 
    price: 'Custom pricing',
    duration: '1.5 Hours',
  }
];

export default function ExperiencesPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20 px-4 md:px-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-[#8E5022] text-sm font-bold uppercase tracking-widest mb-3 block">
          Basho Lifestyle
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-[#442D1C] mb-6 leading-tight">
          Curated <span className="italic text-[#8E5022]">Experiences</span>
        </h1>
        <p className="text-[#8E5022]/80 text-lg leading-relaxed max-w-2xl mx-auto">
          Beyond products, Basho offers moments. From intimate dates to lively parties, 
          immerse yourself in the art of Japanese pottery.
        </p>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-3xl overflow-hidden border border-[#EDD8B4] hover:border-[#C85428]/30 hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row h-full md:h-[320px]"
          >
            {/* Image Side */}
            <div className="md:w-[45%] h-64 md:h-full relative overflow-hidden">
               <img 
                 src={exp.image} 
                 alt={exp.title}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
               <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[#442D1C] flex items-center gap-2 shadow-sm">
                  {exp.icon} {exp.title}
               </div>
            </div>

            {/* Content Side */}
            <div className="p-8 md:w-[55%] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[#442D1C] mb-3 group-hover:text-[#C85428] transition-colors">
                  {exp.title}
                </h3>
                <p className="text-[#8E5022]/80 text-sm leading-relaxed mb-4">
                  {exp.description}
                </p>
                
                {/* Meta Details */}
                <div className="flex gap-4 text-xs font-medium text-[#442D1C]/60 mb-6">
                   <span className="flex items-center gap-1 bg-[#FDFBF7] px-2 py-1 rounded border border-[#EDD8B4]/50">
                     <Clock className="w-3 h-3" /> {exp.duration}
                   </span>
                   <span className="flex items-center gap-1 bg-[#FDFBF7] px-2 py-1 rounded border border-[#EDD8B4]/50">
                     <MapPin className="w-3 h-3" /> Surat Studio
                   </span>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-[#EDD8B4]/30 flex items-center justify-between gap-4">
                <p className="text-[#442D1C] font-bold text-lg">{exp.price}</p>
                
                {/* Unified Button for All Cards */}
                <Link 
                  href="/contact"
                  className="px-6 py-2.5 bg-[#442D1C] text-[#EDD8B4] rounded-xl hover:bg-[#652810] transition-all text-sm font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Book Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}