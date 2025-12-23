'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Instagram, 
  Facebook, 
  Mail, 
  MapPin, 
  Phone, 
  Leaf, 
  Sparkles,
  ArrowUpRight,
  Copyright
} from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()

  // Hide on Admin pages
  if (pathname && pathname.startsWith('/admin')) {
    return null
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 }
    }
  }

  return (
    <footer className="relative bg-gradient-to-b from-white to-[#FDFBF7] border-t border-[#EDD8B4]/30 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#8E5022]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#C85428]/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <motion.div variants={fadeInUp} className="lg:col-span-1">
              <div className="mb-8">
                <Link href="/" className="inline-block">
                  <div className="flex items-center gap-3 mb-6">
                    <img 
                      src="/images/Basho - logotm-03.jpg" 
                      alt="Basho Logo" 
                      className="h-16 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#8E5022] to-[#C85428] flex items-center justify-center">
                            <span class="font-serif text-white text-2xl">芭</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </Link>
                <p className="text-stone-600 leading-relaxed mb-8 max-w-xs">
                  Inspired by Matsuo Bashō's poetry. Earth, water, and fire coming together to create living objects for your home.
                </p>
                <div className="flex items-center gap-4">
                  <motion.a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 rounded-full bg-[#EDD8B4]/20 flex items-center justify-center text-[#8E5022] hover:bg-[#8E5022] hover:text-white transition-all"
                  >
                    <Instagram className="h-4 w-4" />
                  </motion.a>
                  <motion.a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 rounded-full bg-[#EDD8B4]/20 flex items-center justify-center text-[#8E5022] hover:bg-[#8E5022] hover:text-white transition-all"
                  >
                    <Facebook className="h-4 w-4" />
                  </motion.a>
                  <motion.a 
                    href="mailto:hello@bashoceramics.com"
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 rounded-full bg-[#EDD8B4]/20 flex items-center justify-center text-[#8E5022] hover:bg-[#8E5022] hover:text-white transition-all"
                  >
                    <Mail className="h-4 w-4" />
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="font-serif text-xl text-[#442D1C] mb-6 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Explore
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/products", label: "Shop Collection" },
                  { href: "/workshops", label: "Pottery Workshops" },
                  { href: "/custom", label: "Custom Orders" },
                  { href: "/gift-cards", label: "Gift Cards" },
                  { href: "/lookbook", label: "Lookbook" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 text-stone-600 hover:text-[#C85428] transition-colors group"
                    >
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div variants={fadeInUp}>
              <h3 className="font-serif text-xl text-[#442D1C] mb-6 flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Company
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/about", label: "Our Story" },
                  { href: "/philosophy", label: "Philosophy" },
                  { href: "/artisans", label: "Meet the Artisans" },
                  { href: "/sustainability", label: "Sustainability" },
                  { href: "/careers", label: "Careers" },
                  { href: "/press", label: "Press" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 text-stone-600 hover:text-[#C85428] transition-colors group"
                    >
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={fadeInUp}>
              <h3 className="font-serif text-xl text-[#442D1C] mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#8E5022] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-stone-600">Studio Address</p>
                    <p className="text-sm text-stone-500">Vadodara, Gujarat<br />India 390001</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#8E5022] flex-shrink-0" />
                  <a href="tel:+911234567890" className="text-stone-600 hover:text-[#C85428] transition-colors">
                    +91 12345 67890
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#8E5022] flex-shrink-0" />
                  <a href="mailto:hello@bashoceramics.com" className="text-stone-600 hover:text-[#C85428] transition-colors">
                    hello@bashoceramics.com
                  </a>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-8">
                <p className="text-sm text-stone-600 mb-3">Join our newsletter</p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 rounded-full border border-[#EDD8B4] bg-white/50 focus:outline-none focus:border-[#8E5022] text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[#8E5022] text-white text-sm hover:bg-[#652810] transition-colors"
                  >
                    Join
                  </button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#EDD8B4]/50 to-transparent mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-stone-500 flex items-center gap-1">
              <Copyright className="h-3 w-3" />
              {new Date().getFullYear()} Bashō Ceramics. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-stone-500 hover:text-[#C85428] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-stone-500 hover:text-[#C85428] transition-colors">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-stone-500 hover:text-[#C85428] transition-colors">
                Shipping Policy
              </Link>
              <Link href="/returns" className="text-stone-500 hover:text-[#C85428] transition-colors">
                Returns
              </Link>
            </div>
          </div>

          {/* Japanese Signature */}
          <div className="mt-8 text-center">
            <p className="text-xs text-stone-400 tracking-widest">
              手作り陶器 · 心を込めて · Handcrafted with heart
            </p>
          </div>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ y: -5 }}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white shadow-lg flex items-center justify-center z-40 hover:shadow-xl transition-all"
        aria-label="Scroll to top"
      >
        <ArrowUpRight className="h-5 w-5 rotate-270" />
      </motion.button>
    </footer>
  )
}