"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";
import BookingWidget from "@/components/workshops/BookingWidget";

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
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function WorkshopDetailClient({ workshop }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-[#C85428] selection:text-white">
      {/* --- Back Button --- */}
      <div className="fixed top-26 left-6 z-50">
        <Link href="/workshops">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-stone-100"
          >
            <ArrowLeft className="w-5 h-5 text-[#442D1C]" />
            <span className="font-medium text-[#442D1C]">
              Back to Workshops
            </span>
          </motion.button>
        </Link>
      </div>

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#EDD8B4]/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C85428]/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT COL: Content (8 cols) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-8 space-y-12"
          >
            {/* Header Image */}
            <motion.div
              variants={scaleIn}
              className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-[#442D1C]/5"
            >
              <Image
                src={workshop.image || "/placeholder.jpg"}
                alt={workshop.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider text-[#442D1C] shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C85428]" />
                {workshop.level}
              </motion.div>
            </motion.div>

            {/* Title & Stats */}
            <motion.div variants={fadeInUp}>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#8E5022] uppercase tracking-wider">
                <span>Workshops</span>
                <span>/</span>
                <span>{workshop.level}</span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl text-[#442D1C] mb-8 leading-tight">
                {workshop.title}
              </h1>

              {/* Stats Grid - Mimicking Product Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Clock, label: "Duration", val: workshop.duration },
                  {
                    icon: Users,
                    label: "Class Size",
                    val: `Max ${workshop.maxStudents}`,
                  },
                  { icon: Globe, label: "Language", val: workshop.language },
                  { icon: MapPin, label: "Location", val: "Studio Bashō" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FDFBF7] border border-[#EDD8B4] flex items-center justify-center text-[#C85428] mb-3">
                      <stat.icon size={20} />
                    </div>
                    <p className="text-[10px] text-[#8E5022] uppercase font-bold tracking-widest mb-1">
                      {stat.label}
                    </p>
                    <p className="text-[#442D1C] font-serif font-medium text-lg">
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
              <h3 className="font-serif text-3xl text-[#442D1C] flex items-center gap-3 mb-6">
                About the Workshop
              </h3>
              <p className="whitespace-pre-wrap">{workshop.description}</p>

              {/* Highlight Box */}
              <div className="my-8 p-8 bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/20 rounded-3xl not-prose border border-[#EDD8B4]/30">
                <h4 className="font-serif text-xl text-[#442D1C] mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#8E5022]" /> What you'll learn
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Fallback items if no structured learning points exist */}
                  <li className="flex items-center gap-2 text-stone-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{" "}
                    Hand-building techniques
                  </li>
                  <li className="flex items-center gap-2 text-stone-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{" "}
                    Wheel throwing basics
                  </li>
                  <li className="flex items-center gap-2 text-stone-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{" "}
                    Glazing application
                  </li>
                  <li className="flex items-center gap-2 text-stone-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />{" "}
                    Firing process overview
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Instructor Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-[#442D1C] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl"
            >
              {/* Decorative Circle */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#EDD8B4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                <div className="relative w-36 h-36 flex-shrink-0">
                  <Image
                    src={workshop.instructorImage || "/placeholder-user.jpg"}
                    alt={workshop.instructorName}
                    fill
                    className="object-cover rounded-full border-4 border-[#EDD8B4]/20 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#C85428] text-white p-2.5 rounded-full shadow-lg border-4 border-[#442D1C]">
                    <Award size={18} />
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <p className="text-[#C85428] font-bold tracking-[0.2em] text-xs uppercase mb-3">
                    Your Instructor
                  </p>
                  <h3 className="font-serif text-3xl md:text-4xl text-[#EDD8B4] mb-2">
                    {workshop.instructorName}
                  </h3>
                  <p className="text-white/60 text-sm mb-6 font-medium">
                    {workshop.instructorRole}
                  </p>
                  <p className="text-[#EDD8B4]/90 leading-relaxed italic text-lg font-serif opacity-90">
                    "{workshop.instructorBio}"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Gallery */}
            {workshop.gallery && workshop.gallery.length > 0 && (
              <motion.div variants={fadeInUp}>
                <h3 className="font-serif text-3xl text-[#442D1C] mb-8">
                  Student Work
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {workshop.gallery.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square rounded-3xl overflow-hidden shadow-md cursor-zoom-in"
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${i}`}
                        fill
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
            <div className="sticky top-28 space-y-6">
              {/* Booking Widget Wrapper */}
              <div className="relative z-20">
                <BookingWidget
                  workshopId={workshop.id}
                  price={workshop.price}
                  title={workshop.title}
                  sessions={workshop.WorkshopSession}
                />
              </div>

              {/* Location Mini-Map / Info - Styled like Product Care/Guarantee boxes */}
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-[#EDD8B4] flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-white p-3.5 rounded-2xl text-[#C85428] shadow-sm border border-[#EDD8B4]/30">
                  <MapPin size={22} />
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
                    href="#"
                    className="text-xs font-bold text-[#C85428] mt-3 inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Get Directions <ArrowRight size={12} />
                  </a>
                </div>
              </div>

              {/* Guarantee Box Match */}
              <div className="bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-3xl p-6 border border-stone-100">
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
  );
}
