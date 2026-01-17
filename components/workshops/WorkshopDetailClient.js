'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  MapPin,
  Globe,
  Award,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
} from 'lucide-react';
import BookingWidget from '@/components/workshops/BookingWidget';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function WorkshopDetailClient({ workshop }) {
  return (
    <div className="min-h-screen text-stone-800 font-sans selection:bg-[#C85428] selection:text-white">
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#EDD8B4]/60 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-[#C85428]/10 rounded-full blur-[60px] md:blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Main Content Wrapper - Removed pt-24 here as it's handled in page.js now */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* --- Back Button --- */}
          <div className="mb-6 md:mb-8">
            <Link href="/workshops" className="inline-block">
              <motion.button
                whileHover={{ x: -4 }}
                className="flex items-center justify-center gap-2 bg-white p-3 md:px-4 md:py-2.5 rounded-full shadow-sm hover:shadow-md text-[#442D1C] transition-all border border-stone-100"
              >
                <ArrowLeft size={20} />
                <span className="hidden md:block font-serif font-medium text-sm">
                  Back to Workshops
                </span>
              </motion.button>
            </Link>
          </div>

          {/* --- Main Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* LEFT COL: Content (8 cols) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-8 space-y-8 md:space-y-12"
            >
              {/* Header Image */}
              <motion.div
                variants={scaleIn}
                className="relative aspect-video rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-[#442D1C]/5"
              >
                <Image
                  src={workshop.image || '/placeholder.jpg'}
                  alt={workshop.title}
                  fill
                  className="object-cover"
                  style={{
                    objectPosition: 'center center',
                    transform: 'scale(1.1)',
                  }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/95 backdrop-blur-md px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider text-[#442D1C] shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C85428]" />
                  {workshop.level}
                </motion.div>
              </motion.div>

              {/* Title & Stats */}
              <motion.div variants={fadeInUp}>
                <div className="mb-3 md:mb-4 flex items-center gap-2 text-xs md:text-sm font-medium text-[#8E5022] uppercase tracking-wider">
                  <span>Workshops</span>
                  <span>/</span>
                  <span>{workshop.level}</span>
                </div>

                <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-[#442D1C] mb-6 md:mb-8 leading-tight">
                  {workshop.title}
                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { icon: Clock, label: 'Duration', val: workshop.duration },
                    {
                      icon: Users,
                      label: 'Class Size',
                      val: `Max ${workshop.maxStudents}`,
                    },
                    { icon: Globe, label: 'Language', val: workshop.language },
                    { icon: MapPin, label: 'Location', val: 'Studio Bashō' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FDFBF7] border border-[#EDD8B4] flex items-center justify-center text-[#C85428] mb-2 md:mb-3">
                        <stat.icon size={18} className="md:w-5 md:h-5" />
                      </div>
                      <p className="text-[10px] text-[#8E5022] uppercase font-bold tracking-widest mb-1">
                        {stat.label}
                      </p>
                      <p className="text-[#442D1C] font-serif font-medium text-sm md:text-lg">
                        {stat.val}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div
                variants={fadeInUp}
                className="prose prose-stone prose-lg max-w-none text-stone-600 leading-relaxed"
              >
                <h3 className="font-serif text-2xl md:text-3xl text-[#442D1C] flex items-center gap-3 mb-4 md:mb-6">
                  About the Workshop
                </h3>
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {workshop.description}
                </p>

                {/* Highlight Box */}
                <div className="my-6 md:my-8 p-6 md:p-8 bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/20 rounded-3xl not-prose border border-[#EDD8B4]/30">
                  <h4 className="font-serif text-lg md:text-xl text-[#442D1C] mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#8E5022]" /> What you'll
                    learn
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
                    <li className="flex items-center gap-2 text-stone-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{' '}
                      Hand-building techniques
                    </li>
                    <li className="flex items-center gap-2 text-stone-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{' '}
                      Wheel throwing basics
                    </li>
                    <li className="flex items-center gap-2 text-stone-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{' '}
                      Glazing application
                    </li>
                    <li className="flex items-center gap-2 text-stone-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{' '}
                      Firing process overview
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Instructor Card */}
              <motion.div
                variants={fadeInUp}
                className="bg-[#442D1C] rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-60 md:w-80 h-60 md:h-80 bg-[#EDD8B4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                  <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0">
                    <Image
                      src={workshop.instructorImage || '/placeholder-user.jpg'}
                      alt={workshop.instructorName}
                      fill
                      className="object-cover rounded-full border-4 border-[#EDD8B4]/20 shadow-xl"
                    />
                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-[#C85428] text-white p-2 md:p-2.5 rounded-full shadow-lg border-4 border-[#442D1C]">
                      <Award size={16} className="md:w-[18px] md:h-[18px]" />
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="text-[#C85428] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-2 md:mb-3">
                      Your Instructor
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#EDD8B4] mb-1 md:mb-2">
                      {workshop.instructorName}
                    </h3>
                    <p className="text-white/60 text-xs md:text-sm mb-4 md:mb-6 font-medium">
                      {workshop.instructorRole}
                    </p>
                    <p className="text-[#EDD8B4]/90 leading-relaxed italic text-base md:text-lg font-serif opacity-90">
                      "{workshop.instructorBio}"
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Gallery */}
              {workshop.gallery && workshop.gallery.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <h3 className="font-serif text-2xl md:text-3xl text-[#442D1C] mb-6 md:mb-8">
                    Student Work
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {workshop.gallery.map((img, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-md cursor-zoom-in"
                      >
                        <Image
                          src={img}
                          alt={`Gallery ${i}`}
                          fill
                          style={{
                            objectPosition: 'center center',
                            transform: 'scale(1.1)',
                          }}
                          className="object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* RIGHT COL: Sticky Booking (4 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="lg:col-span-4 relative"
            >
              <div className="lg:sticky lg:top-28 space-y-6">
                {/* Booking Widget Wrapper */}
                <div className="relative z-20">
                  <BookingWidget
                    workshopId={workshop.id}
                    price={workshop.price}
                    title={workshop.title}
                    sessions={workshop.WorkshopSession}
                  />
                </div>

                {/* Location Mini-Map */}
                <div className="bg-white/50 backdrop-blur-sm p-5 md:p-6 rounded-3xl border border-[#EDD8B4] flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-white p-3 rounded-2xl text-[#C85428] shadow-sm border border-[#EDD8B4]/30">
                    <MapPin size={20} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <div>
                    <p className="font-serif text-[#442D1C] text-lg mb-1">
                      Studio Location
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {workshop.location}
                      <br />
                      Surat, Gujarat
                    </p>
                    <a
                      href="https://www.google.com/maps?q=21.1299866,72.7239895&z=17&hl=en"
                      target="_blank"
                      className="text-xs font-bold text-[#C85428] mt-3 inline-flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Get Directions <ArrowRight size={12} />
                    </a>
                  </div>
                </div>

                {/* Guarantee Box */}
                <div className="bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-3xl p-5 md:p-6 border border-stone-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#8E5022]" />
                    <h4 className="font-serif text-lg text-[#442D1C]">
                      Flexible Rescheduling
                    </h4>
                  </div>
                  <p className="text-sm text-stone-600">
                    Free rescheduling up to 48 hours before the session starts.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
