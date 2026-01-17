"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scroll, Feather, Mountain, Quote, ArrowRight } from "lucide-react";
import Link from "next/link";

// --- Colors ---
const COLORS = {
  dark: "#442D1C",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const textReveal = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay: 0.2 },
  },
};

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#442D1C] font-sans selection:bg-[#C85428] selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-4">
        {/* Parallax Background Effect */}
        <div className="absolute inset-0 bg-[#EDD8B4]/20 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C85428]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8E5022]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              The Bashō Philosophy
            </span>
            <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-6 text-[#442D1C]">
              Poetry in Clay,
              <br />
             <span className="text-[#C85428]">Stillness in Motion.</span> 
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Inspired by the Japanese poet Matsuo Bashō, we craft earthy, raw
              tableware that invites you to pause and appreciate the imperfect
              beauty of life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- THE INSPIRATION (Matsuo Basho) --- */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] rounded-3xl overflow-hidden bg-stone-200"
          >
            <img
              src="https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=1000&auto=format&fit=crop"
              alt="Japanese Aesthetics"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#442D1C]/20 mix-blend-multiply" />
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textReveal}
            className="space-y-8"
          >
            <Scroll className="w-10 h-10 text-[#C85428]" />
            <h2 className="font-serif text-4xl text-[#442D1C]">
              The Poet's Path
            </h2>

            <blockquote className="border-l-4 border-[#EDD8B4] pl-6 italic text-xl text-[#8E5022] font-serif">
              "The old pond,
              <br />
              A frog jumps in:
              <br />
              Plop! Sound of water."
            </blockquote>

            <p className="text-stone-600 leading-relaxed text-lg">
              Basho by Shivangi draws its soul from{" "}
              <strong>Matsuo Bashō</strong>, the most famous poet of the Edo
              period in Japan. His haikus captured the profound simplicity of
              nature—the silence of a pond, the rustle of leaves, the solitude
              of travel.
            </p>
            <p className="text-stone-600 leading-relaxed text-lg">
              We translate this literary minimalism into physical form. Our
              ceramics are not just objects; they are{" "}
              <strong>Haikus in Clay</strong>. Raw, unpretentious, and deeply
              connected to the earth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- THE FOUNDER (Shivangi) --- */}
      <section className="py-24 px-4 bg-[#442D1C] text-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-6">
              The Hands Behind the Wheel
            </h2>
            <div className="w-24 h-1 bg-[#C85428] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <h3 className="text-2xl font-serif text-[#EDD8B4]">
                Shivangi's Journey
              </h3>
              <p className="text-stone-300 leading-relaxed text-lg">
                For Shivangi, pottery wasn't just a hobby; it was a return to
                self. After years in the corporate rush, she found stillness in
                the rhythm of the potter's wheel.
              </p>
              <p className="text-stone-300 leading-relaxed text-lg">
                "I wanted to create something that felt *alive*. Modern
                tableware is often too perfect, too sterile. I wanted to bring
                back the texture of the soil, the unpredictability of the kiln,
                and the warmth of human touch."
              </p>
            </div>

            <div className="order-1 md:order-2 relative h-[500px] rounded-full overflow-hidden border-4 border-[#EDD8B4]/20 mx-auto w-full md:w-[80%]">
              <img
                src="brand/founder.jpg"
                alt="Shivangi at the wheel"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- WABI SABI VALUES --- */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
           <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              Our Ethos
            </span>
            <h2 className="font-serif text-4xl mt-3 text-[#442D1C]">
              Wabi-Sabi Aesthetics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mountain className="w-8 h-8 text-[#C85428]" />,
                title: "Imperfection",
                desc: "We celebrate asymmetry and roughness. No two pieces are identical, just like no two moments in life are the same.",
              },
              {
                icon: <Feather className="w-8 h-8 text-[#C85428]" />,
                title: "Transience",
                desc: "Our clay bodies age gracefully. The glazes crackle and change over time, telling the story of the meals shared upon them.",
              },
              {
                icon: <Quote className="w-8 h-8 text-[#C85428]" />,
                title: "Simplicity",
                desc: "Eliminating the unnecessary. Our designs are stripped back to their essence, allowing the food and the company to shine.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-8 rounded-3xl border border-stone-100 hover:shadow-xl hover:border-[#EDD8B4] transition-all duration-300"
              >
                <div className="mb-6 bg-[#FDFBF7] w-16 h-16 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-serif text-2xl mb-4 text-[#442D1C]">
                  {item.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20 px-4 bg-[#EDD8B4]/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl mb-6 text-[#442D1C]">
            Bring the philosophy home
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            Explore our curated collection of handcrafted stoneware and
            experience the poetry of clay.
          </p>
          <Link href="/products">
            <button className="bg-[#8E5022] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#652810] transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
              View Collections <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
