"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, Utensils, Flame, Heart, Droplet, Sparkles, ChevronDown, Moon, Sun, Mountain, Waves } from 'lucide-react';
import Link from 'next/link';

// --- Brand Colors from Palette ---
const COLORS = {
  dark: '#442D1C',
  brown: '#652810',
  clay: '#8E5022',
  terracotta: '#C85428',
  cream: '#EDD8B4',
  background: '#FDFBF7'
};

// --- Enhanced Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.7,
      ease: "easeOut" 
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.15,
      delayChildren: 0.1 
    } 
  }
};

const floatAnimation = {
  initial: { y: 0 },
  animate: { 
    y: [-10, 10, -10],
    transition: { 
      duration: 6, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const cursorX = useTransform(scrollY, [0, 1000], [mousePosition.x, mousePosition.x * 0.5]);
  const cursorY = useTransform(scrollY, [0, 1000], [mousePosition.y, mousePosition.y * 0.5]);

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

      {/* 1. HERO SECTION with Enhanced Visuals */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7] via-[#FDFBF7] to-[#EDD8B4]/30" />
          
          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#8E5022]/20"
              initial={{ x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
              animate={{
                x: [null, Math.random() * 100 + 'vw'],
                y: [null, Math.random() * 100 + 'vh'],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
          
            {/* Hero Image with Parallax */}
            <motion.div 
              className="absolute inset-0"
              style={{ scale: heroScale, opacity: heroOpacity }}
            >
              <img 
                src="\images\Landing Page Hero.jpg" 
                alt="Basho Ceramics" 
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
            </motion.div>
          </div>

          {/* Hero Content */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 text-center px-4 max-w-6xl mx-auto text-white"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-[#EDD8B4]" />
            <p className="font-sans text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-95">
              Handcrafted Japanese Ceramics
            </p>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="font-serif text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.9] tracking-tight"
          >
            <span className="block text-[#EDD8B4]">Bashō</span>
            <span className="block text-4xl md:text-6xl lg:text-7xl mt-4 font-light">
              The Beauty of <span className="italic">Impermanence</span>
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto opacity-95 leading-relaxed"
          >
            Earth whispers through clay, water shapes the form, fire gives it soul. 
            Inspired by Matsuo Bashō's poetry, we create living objects for mindful moments.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#EDD8B4] text-[#442D1C] px-10 py-4 rounded-full font-medium text-lg hover:bg-[#E8D0A0] transition-all shadow-lg hover:shadow-xl min-w-[180px] flex items-center justify-center gap-3 group"
              >
                Shop Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-[#EDD8B4] text-[#EDD8B4] px-10 py-4 rounded-full font-medium text-lg hover:bg-[#EDD8B4]/10 transition-all backdrop-blur-sm min-w-[180px]"
              >
                Our Story
              </motion.button>
            </Link>
          </motion.div>
          
          {/* Scroll Indicator */}
          <motion.div
            animate="animate"
            variants={floatAnimation}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-[#EDD8B4] animate-pulse" />
          </motion.div>
        </motion.div>
      </section>

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
                Tableware for <br/>
                <span className="text-[#C85428]">Mindful</span> Moments
              </h2>
              
              <p className="text-stone-600 text-lg mb-10 leading-relaxed">
                From morning matcha rituals to intimate dinner gatherings, our collections transform daily meals into mindful experiences. Each piece is designed to be held, appreciated, and passed down through generations.
              </p>
              
              <div className="space-y-6 mb-10">
                <CollectionLink 
                  href="/products/tea-ware"
                  title="Tea Ceremony Collection"
                  description="Matcha bowls, teapots, and incense holders"
                />
                <CollectionLink 
                  href="/products/dinnerware"
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
                  whileHover={{ scale: 1.05, backgroundColor: COLORS.terracotta }}
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
                <h4 className="font-serif text-xl mb-4 text-[#EDD8B4]">Care Instructions</h4>
                <p className="text-stone-300 leading-relaxed">
                  While durable, hand washing with mild soap preserves the glaze's luster. 
                  Avoid sudden temperature changes. Each piece develops a unique patina 
                  with use—a beautiful record of shared meals and memories.
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
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
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
                "Pottery is my conversation with the earth. Each piece begins as a whisper 
                in the clay—a moment captured, a feeling remembered. Through Bashō, I invite 
                you to touch this poetry, to make it part of your story."
              </motion.blockquote>
              
              <div className="space-y-4">
                <div className="font-serif text-2xl text-[#8E5022]">Shivangi</div>
                <div className="text-stone-600 uppercase tracking-widest text-sm">
                  Founder & Master Potter
                </div>
              </div>
              
              {/* Interactive CTA */}
              <motion.div
                variants={fadeInUp}
                className="mt-16"
              >
                <Link href="/about">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: COLORS.dark,
                      color: COLORS.cream
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
            Discover pieces that speak to your soul, crafted to become part of your story.
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

// --- Enhanced Sub Components ---

function PhilosophyCard({ title, subtitle, icon, description, color, delay = 0, featured = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className={`relative rounded-3xl p-10 backdrop-blur-sm border transition-all duration-500 overflow-hidden group ${
        featured 
          ? 'bg-gradient-to-br from-white to-[#EDD8B4]/20 border-[#C85428]/30 shadow-2xl scale-105 z-10' 
          : 'bg-white/80 border-stone-200 shadow-lg hover:shadow-2xl'
      }`}
    >
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ 
          background: `radial-gradient(circle at center, ${color}10, transparent 70%)`
        }}
      />
      
      <div className="relative z-10">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110"
          style={{ backgroundColor: color + '15' }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        
        <h3 className="font-serif text-3xl mb-2" style={{ color }}>
          {title}
        </h3>
        <div className="text-sm text-stone-500 mb-6 font-japanese">{subtitle}</div>
        
        <p className="text-stone-600 leading-relaxed mb-6">
          {description}
        </p>
        
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