"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Flame,
  Droplet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Mountain,
  Utensils,
  Heart,
  ChevronDown, // Added for scroll indicator if needed later, though not used in the carousel version
} from "lucide-react";
import Link from "next/link";

// --- Brand Colors ---
const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

// --- Hero Carousel Data ---
const HERO_SLIDES = [
  {
    id: 1,
    title: "The Art of Earth",
    subtitle: "Handcrafted ceramics for mindful living.",
    cta: "Shop Collection",
    link: "/products",
    // Using the image from your previous hero section as the main shop image
    image: "/images/others/landing-page-hero.jpg",
    position: "center 30%",
  },
  {
    id: 2,
    title: "Touch the Clay",
    subtitle: "Join our hands-on workshops in Surat.",
    cta: "Book a Session",
    link: "/workshops",
    // Using one of your product images for the workshop slide
    image: "/showcase/products/1.png",
    position: "center center",
  },
  {
    id: 3,
    title: "Join Our Circle",
    subtitle: "Connect with artisans and admirers.",
    cta: "Read Our Story",
    link: "/connect",
    // Using the founder image for the connect slide
    image: "/brand/founder.jpg",
    position: "center 20%",
  },
];

// --- Animation Variants (Combined) ---

// Carousel Specific Variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 6, ease: "linear" }, // Ken Burns effect
    },
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

const textReveal = {
  hidden: { y: 40, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1 + 0.3,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// General Page Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  // --- States for Custom Cursor & Particles (From Original) ---
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // --- States for Carousel (From New Hero) ---
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef(null);

  // --- Effects for Custom Cursor & Particles ---
  useEffect(() => {
    setParticles(
      [...Array(21)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 10,
      }))
    );

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const cursorX = useTransform(
    scrollY,
    [0, 1000],
    [mousePosition.x, mousePosition.x * 0.5]
  );
  const cursorY = useTransform(
    scrollY,
    [0, 1000],
    [mousePosition.y, mousePosition.y * 0.5]
  );

  // --- Effects & Logic for Carousel ---
  useEffect(() => {
    if (isAutoPlaying) {
      timeoutRef.current = setTimeout(() => {
        paginate(1);
      }, 6000); // 6 seconds per slide
    }
    return () => clearTimeout(timeoutRef.current);
  }, [index, isAutoPlaying]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = HERO_SLIDES.length - 1;
      if (nextIndex >= HERO_SLIDES.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const handleDotClick = (newIndex) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
    setIsAutoPlaying(false); // Stop autoplay if user interacts
  };

  const currentSlide = HERO_SLIDES[index];

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans overflow-x-hidden">
      {/* Custom Cursor Effect */}
      <motion.div
        className="fixed w-6 h-6 rounded-full border border-[#8E5022]/30 pointer-events-none z-50 mix-blend-difference"
        style={{ x: cursorX, y: cursorY }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#8E5022] to-[#C85428] z-50"
        style={{ scaleX: useTransform(scrollY, [0, 1000], [0, 1]) }}
      />

      {/* Floating Particles (Background) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-5 h-5 z-0 rounded-full bg-[#8E5022]/10"
            initial={{ x: `${p.x}vw`, y: `${p.y}vh` }}
            animate={{
              x: [null, `${Math.random() * 100}vw`],
              y: [null, `${Math.random() * 100}vh`],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* =========================================
          1. NEW CAROUSEL HERO SECTION
      ========================================= */}
      <section className="relative h-screen w-full overflow-hidden bg-[#442D1C]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Image */}
            <div className="absolute inset-0">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover"
                style={{ objectPosition: currentSlide.position }}
              />
              {/* Cinematic Overlay: Gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#442D1C]/50 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Text Content Layer */}
        <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start px-4 md:px-16 lg:px-24">
          <div className="max-w-3xl overflow-hidden text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={index} // Remount text on slide change
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                <motion.div
                  custom={0}
                  variants={textReveal}
                  className="mb-4 flex justify-center md:justify-start"
                >
                  <div className="inline-flex items-center gap-3">
                    <div className="w-12 h-[1px] bg-[#EDD8B4]" />
                    <span className="text-[#EDD8B4] uppercase tracking-[0.3em] text-sm font-medium">
                      Bashō Pottery
                    </span>
                    <div className="w-12 h-[1px] bg-[#EDD8B4] md:hidden" />
                  </div>
                </motion.div>

                <motion.h1
                  custom={1}
                  variants={textReveal}
                  className="font-serif text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-[1.1]"
                >
                  {currentSlide.title}
                </motion.h1>

                <motion.p
                  custom={2}
                  variants={textReveal}
                  className="text-lg md:text-2xl text-stone-200 font-light mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed"
                >
                  {currentSlide.subtitle}
                </motion.p>

                <motion.div
                  custom={3}
                  variants={textReveal}
                  className="flex justify-center md:justify-start"
                >
                  <Link href={currentSlide.link}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group bg-[#EDD8B4] text-[#442D1C] px-8 py-4 md:px-10 md:py-5 rounded-full font-medium text-lg flex items-center gap-3 shadow-[0_0_20px_rgba(237,216,180,0.3)] hover:shadow-[0_0_30px_rgba(237,216,180,0.5)] transition-shadow"
                    >
                      {currentSlide.cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-0 right-0 z-30 px-4 md:px-16 lg:px-24 flex items-center justify-between">
          {/* Progress / Dots */}
          <div className="flex gap-4">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className="group relative py-2" // Larger hit area
              >
                <div
                  className={`h-1 transition-all duration-500 rounded-full ${
                    i === index ? "w-12 bg-[#EDD8B4]" : "w-6 bg-white/30"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                paginate(-1);
                setIsAutoPlaying(false);
              }}
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-md transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                paginate(1);
                setIsAutoPlaying(false);
              }}
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-md transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* =========================================
          2. REST OF THE CONTENT (From Original)
      ========================================= */}

      {/* 2. PHILOSOPHY SECTION with Interactive Cards */}
      <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#8E5022] blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#C85428] blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-[#8E5022]" />
              <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium">
                Japanese Aesthetics
              </span>
              <div className="w-12 h-px bg-[#8E5022]" />
            </div>
            <h2 className="font-serif text-5xl md:text-6xl text-[#442D1C] mb-6">
              Philosophy & <span className="text-[#C85428]">Clay</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Where ancient wisdom meets modern craftsmanship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            <PhilosophyCard
              title="Wabi-sabi"
              subtitle="侘寂"
              icon={<Leaf className="w-8 h-8" />}
              description="Celebrating imperfection, impermanence, and incompleteness. Each crack, each uneven surface tells a story of natural beauty."
              color="#442D1C"
              delay={0}
            />
            <PhilosophyCard
              title="Fueki-Ryuko"
              subtitle="不易流行"
              icon={<Flame className="w-8 h-8" />}
              description="The balance of permanence and change. Timeless techniques meet contemporary forms in a dance of tradition and innovation."
              color="#C85428"
              delay={0.1}
              featured
            />
            <PhilosophyCard
              title="Karumi"
              subtitle="軽み"
              icon={<Droplet className="w-8 h-8" />}
              description="Lightness of being. Finding profound meaning in simple moments and bringing poetic grace to daily rituals."
              color="#8E5022"
              delay={0.2}
            />
          </div>
        </motion.div>
      </section>

      {/* 3. PRODUCTS SECTION with Parallax */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/20" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Gallery with Hover Effects */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="relative h-[600px]"
            >
              <motion.div
                variants={fadeInScale}
                className="absolute top-0 left-0 w-4/5 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-20"
                whileHover={{ y: -10 }}
              >
                <img
                  src="/showcase/products/1.png"
                  alt="Tea Bowl Collection"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>

              <motion.div
                variants={fadeInScale}
                className="absolute bottom-0 right-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ y: -10 }}
              >
                <img
                  src="/showcase/products/2.png"
                  alt="Dinnerware Set"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-10 -left-10 w-40 h-40 rounded-full bg-[#C85428]/10 blur-2xl" />
              <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#8E5022]/10 blur-2xl" />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#8E5022] uppercase tracking-widest text-sm font-medium inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4" />
                Curated Collections
              </span>

              <h2 className="font-serif text-5xl md:text-6xl text-[#442D1C] mb-8 leading-tight">
                Tableware for <br />
                <span className="text-[#C85428]">Mindful</span> Moments
              </h2>

              <p className="text-stone-600 text-lg mb-10 leading-relaxed">
                From morning matcha rituals to intimate dinner gatherings, our
                collections transform daily meals into mindful experiences. Each
                piece is designed to be held, appreciated, and passed down
                through generations.
              </p>

              <div className="space-y-6 mb-10">
                <CollectionLink
                  href="/products?category=tea-ware"
                  title="Tea Ceremony Collection"
                  description="Matcha bowls, teapots, and incense holders"
                />
                <CollectionLink
                  href="/products?category=dinnerware"
                  title="Dining Essentials"
                  description="Complete sets for 2-12 people"
                />
                <CollectionLink
                  href="/custom"
                  title="Bespoke Commissions"
                  description="Custom designs for restaurants & cafes"
                />
              </div>

              <Link href="/products">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: COLORS.terracotta,
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto bg-[#8E5022] text-white px-10 py-4 rounded-full font-medium text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  Explore All Collections
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. CRAFTSMANSHIP SECTION with Interactive Timeline */}
      <section className="py-32 bg-[#442D1C] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#EDD8B4] blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp}>
              <Mountain className="w-12 h-12 mx-auto mb-6 text-[#EDD8B4]" />
              <h2 className="font-serif text-5xl md:text-6xl mb-8">
                The <span className="text-[#EDD8B4]">Journey</span> of Clay
              </h2>
              <p className="text-xl text-stone-300 max-w-2xl mx-auto">
                From earth to art—a 14-step process where patience meets passion
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Process Timeline */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <ProcessStep
                step="01"
                title="Clay Preparation"
                description="Local stoneware clay is wedged and kneaded by hand to remove air bubbles"
              />
              <ProcessStep
                step="02"
                title="Wheel Throwing"
                description="Each piece is thrown on the potter's wheel, guided by rhythm and intuition"
              />
              <ProcessStep
                step="03"
                title="Leather Hard Trimming"
                description="Excess clay is removed, revealing the piece's true form"
              />
              <ProcessStep
                step="04"
                title="Bisque Firing"
                description="First firing at 900°C transforms clay into porous bisqueware"
              />
              <ProcessStep
                step="05"
                title="Glazing"
                description="Hand-dipped in our signature, food-safe glaze formulas"
              />
              <ProcessStep
                step="06"
                title="Final Firing"
                description="High-fire at 1200°C brings out the glaze's true colors and strength"
              />
            </motion.div>

            {/* Material & Care Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
            >
              <h3 className="font-serif text-3xl mb-8 text-[#EDD8B4]">
                Material & Care
              </h3>

              <div className="grid grid-cols-1 gap-8 mb-12">
                <CareFeature
                  icon={<Utensils className="w-6 h-6" />}
                  title="Food Safe"
                  description="All glazes are lead-free and certified food-safe"
                />
                <CareFeature
                  icon={<Flame className="w-6 h-6" />}
                  title="Thermal Safe"
                  description="Withstands temperature extremes from freezer to oven"
                />
                <CareFeature
                  icon={<Droplet className="w-6 h-6" />}
                  title="Dishwasher Safe"
                  description="Durable glazes withstand regular washing"
                />
                <CareFeature
                  icon={<Heart className="w-6 h-6" />}
                  title="Heirloom Quality"
                  description="Designed to last for generations"
                />
              </div>

              <div className="bg-black/20 rounded-2xl p-6">
                <h4 className="font-serif text-xl mb-4 text-[#EDD8B4]">
                  Care Instructions
                </h4>
                <p className="text-stone-300 leading-relaxed">
                  While durable, hand washing with mild soap preserves the
                  glaze's luster. Avoid sudden temperature changes. Each piece
                  develops a unique patina with use—a beautiful record of shared
                  meals and memories.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FOUNDER STORY with Interactive Element */}
      <section className="py-32 bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/30 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center relative"
          >
            {/* Decorative Quote Marks */}
            <div className="absolute -top-10 left-10 text-[#8E5022]/10">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
              </svg>
            </div>

            <motion.div variants={fadeInUp} className="relative z-10">
              {/* Founder Image with Frame */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-48 h-48 mx-auto mb-10 rounded-full overflow-hidden border-4 border-white shadow-2xl relative"
              >
                <img
                  src="/brand/founder.jpg"
                  alt="Shivangi, Founder"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#8E5022]/30 to-transparent" />
              </motion.div>

              <h2 className="font-serif text-5xl md:text-6xl text-[#442D1C] mb-8">
                The <span className="text-[#C85428]">Hand</span> Behind the Clay
              </h2>

              <motion.blockquote
                variants={fadeInUp}
                className="text-2xl md:text-3xl font-light italic text-stone-700 mb-10 leading-relaxed max-w-3xl mx-auto"
              >
                "Pottery is my conversation with the earth. Each piece begins as
                a whisper in the clay—a moment captured, a feeling remembered.
                Through Bashō, I invite you to touch this poetry, to make it
                part of your story."
              </motion.blockquote>

              <div className="space-y-4">
                <div className="font-serif text-2xl text-[#8E5022]">
                  Shivangi
                </div>
                <div className="text-stone-600 uppercase tracking-widest text-sm">
                  Founder & Master Potter
                </div>
              </div>

              {/* Interactive CTA */}
              <motion.div variants={fadeInUp} className="mt-16">
                <Link href="/about">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: COLORS.dark,
                      color: COLORS.cream,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent border-2 border-[#442D1C] text-[#442D1C] px-12 py-4 rounded-full font-medium text-lg hover:shadow-xl transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      Read Full Story
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-32 px-4"
        >
          <h3 className="font-serif text-4xl md:text-5xl text-[#442D1C] mb-8">
            Begin Your <span className="text-[#C85428]">Journey</span> with Clay
          </h3>
          <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto">
            Discover pieces that speak to your soul, crafted to become part of
            your story.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#C85428] text-white px-12 py-5 rounded-full font-medium text-lg hover:shadow-2xl transition-all shadow-lg"
              >
                Shop Now
              </motion.button>
            </Link>
            <Link href="/workshops">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-[#8E5022] text-[#8E5022] px-12 py-5 rounded-full font-medium text-lg hover:bg-[#8E5022]/10 transition-all"
              >
                Join a Workshop
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

// --- Enhanced Sub Components (From Original) ---

function PhilosophyCard({
  title,
  subtitle,
  icon,
  description,
  color,
  delay = 0,
  featured = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className={`relative rounded-3xl p-10 backdrop-blur-sm border transition-all duration-500 overflow-hidden group ${
        featured
          ? "bg-gradient-to-br from-white to-[#EDD8B4]/20 border-[#C85428]/30 shadow-2xl scale-105 z-10"
          : "bg-white/80 border-stone-200 shadow-lg hover:shadow-2xl"
      }`}
    >
      {/* Background Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${color}10, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110"
          style={{ backgroundColor: color + "15" }}
        >
          <div style={{ color }}>{icon}</div>
        </div>

        <h3 className="font-serif text-3xl mb-2" style={{ color }}>
          {title}
        </h3>
        <div className="text-sm text-stone-500 mb-6 font-japanese">
          {subtitle}
        </div>

        <p className="text-stone-600 leading-relaxed mb-6">{description}</p>

        <motion.div
          className="w-12 h-0.5 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
        />
      </div>
    </motion.div>
  );
}

function CollectionLink({ href, title, description }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 10 }}
        className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/50 transition-all group"
      >
        <div className="w-3 h-3 rounded-full bg-[#8E5022] group-hover:scale-150 transition-transform" />
        <div className="flex-1">
          <div className="font-serif text-xl text-[#442D1C] mb-1">{title}</div>
          <div className="text-stone-600 text-sm">{description}</div>
        </div>
        <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-[#C85428] group-hover:translate-x-2 transition-all" />
      </motion.div>
    </Link>
  );
}

function ProcessStep({ step, title, description }) {
  return (
    <motion.div
      whileHover={{ x: 10 }}
      className="flex gap-6 items-start group cursor-pointer"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-[#EDD8B4]/10 border-2 border-[#EDD8B4]/30 flex items-center justify-center text-[#EDD8B4] font-serif text-lg group-hover:bg-[#EDD8B4]/20 transition-colors">
          {step}
        </div>
        <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-[#EDD8B4]/20 -translate-x-1/2 last:hidden" />
      </div>

      <div>
        <h4 className="text-xl font-serif text-[#EDD8B4] mb-2">{title}</h4>
        <p className="text-stone-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function CareFeature({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#EDD8B4]/10 flex items-center justify-center text-[#EDD8B4]">
          {icon}
        </div>
        <div className="font-serif text-xl text-white">{title}</div>
      </div>
      <p className="text-stone-300 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
