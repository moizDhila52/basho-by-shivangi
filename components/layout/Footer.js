'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import {
  Instagram,
  Facebook,
  Mail,
  MapPin,
  Phone,
  Leaf,
  Sparkles,
  ArrowUp,
  ArrowUpRight,
  Copyright,
  Loader2,
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Hide on Admin pages
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Welcome to the family! Check your inbox.', 'success');
        setEmail('');
      } else {
        addToast(data.error || 'Something went wrong', 'error');
      }
    } catch (error) {
      addToast('Failed to connect. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <footer className="relative bg-gradient-to-b from-white to-[#FDFBF7] border-t border-[#EDD8B4]/30 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 rounded-full bg-[#8E5022]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 rounded-full bg-[#C85428]/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 md:px-8 py-12 md:py-16 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          {/* Main Footer Content */}
          {/* CHANGED: grid-cols-2 by default so we can put Explore/Company side-by-side */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            {/* CHANGED: col-span-2 ensures this takes full width on mobile */}
            <motion.div
              variants={fadeInUp}
              className="col-span-2 lg:col-span-1"
            >
              <div className="mb-6">
                <Link href="/" className="inline-block">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/images/Basho - logotm-03.jpg"
                      alt="Basho Logo"
                      className="h-10 md:h-12 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#8E5022] to-[#C85428] flex items-center justify-center shadow-md">
                            <span class="font-serif text-white text-xl font-bold">B.</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </Link>
                <p className="text-stone-600 leading-relaxed mb-6 max-w-sm text-sm">
                  Inspired by Matsuo Bashō's poetry. Earth, water, and fire
                  coming together to create living objects.
                </p>
                <div className="flex items-center gap-3">
                  {[
                    { Icon: Instagram, href: 'https://instagram.com' },
                    { Icon: Facebook, href: 'https://facebook.com' },
                    { Icon: Mail, href: 'mailto:hello@bashoceramics.com' },
                  ].map(({ Icon, href }, idx) => (
                    <motion.a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3 }}
                      className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-[#EDD8B4]/20 flex items-center justify-center text-[#8E5022] hover:bg-[#8E5022] hover:text-white transition-all duration-300"
                    >
                      <Icon className="h-5 w-5 md:h-4 md:w-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Links (Explore) - Takes 1 column (half width on mobile) */}
            <motion.div variants={fadeInUp} className="col-span-1">
              <h3 className="font-serif text-lg text-[#442D1C] mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C85428]" />
                Explore
              </h3>
              <ul className="space-y-3 md:space-y-2">
                {[
                  { href: '/products', label: 'Shop Collection' },
                  { href: '/workshops', label: 'Pottery Workshops' },
                  { href: '/custom-order', label: 'Custom Orders' },
                  { href: '/gallery', label: 'Gallery' },
                  { href: '/events', label: 'Events' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-stone-600 hover:text-[#C85428] transition-colors group text-sm py-1 md:py-0"
                    >
                      <ArrowUpRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 hidden md:block" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company - Takes 1 column (half width on mobile) */}
            <motion.div variants={fadeInUp} className="col-span-1">
              <h3 className="font-serif text-lg text-[#442D1C] mb-4 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-[#C85428]" />
                Company
              </h3>
              <ul className="space-y-3 md:space-y-2">
                {[
                  { href: '/about', label: 'Our Story' },
                  { href: '/artisans', label: 'Meet the Artisans' },
                  { href: '/sustainability', label: 'Sustainability' },
                  { href: '/careers', label: 'Careers' },
                  { href: '/contact', label: 'Contact Us' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-stone-600 hover:text-[#C85428] transition-colors group text-sm py-1 md:py-0"
                    >
                      <ArrowUpRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 hidden md:block" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            {/* CHANGED: col-span-2 ensures this takes full width on mobile */}
            <motion.div
              variants={fadeInUp}
              className="col-span-2 lg:col-span-1"
            >
              <h3 className="font-serif text-lg text-[#442D1C] mb-4">Studio</h3>
              <div className="space-y-4 md:space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#8E5022] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-stone-600 text-sm font-medium">
                      Studio Bashō
                    </p>
                    <p className="text-xs text-stone-500">
                      Surat, Gujarat, India
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#8E5022] flex-shrink-0" />
                  <a
                    href="tel:+911234567890"
                    className="text-stone-600 text-sm hover:text-[#C85428] transition-colors"
                  >
                    +91 12345 67890
                  </a>
                </div>

                {/* Newsletter Form */}
                <div className="mt-6 pt-6 border-t border-[#EDD8B4]/30">
                  <p className="text-[10px] font-bold text-[#8E5022] uppercase tracking-wider mb-3">
                    Newsletter
                  </p>
                  <form
                    className="flex gap-2 w-full max-w-sm"
                    onSubmit={handleSubscribe}
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="flex-1 px-3 py-2.5 rounded-lg border border-[#EDD8B4] bg-white/50 focus:outline-none focus:border-[#8E5022] focus:ring-1 focus:ring-[#8E5022] text-sm md:text-xs transition-all w-full"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 rounded-lg bg-[#442D1C] text-[#EDD8B4] text-xs font-bold hover:bg-[#652810] transition-colors disabled:opacity-70 flex items-center justify-center min-w-[70px]"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        'Join'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#EDD8B4]/50 to-transparent mb-6" />

          {/* Bottom Bar */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 md:gap-4">
            <div className="text-xs text-stone-500 flex items-center gap-1">
              <Copyright className="h-3 w-3" />
              {new Date().getFullYear()} Bashō Ceramics.
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium">
              <Link
                href="/privacy"
                className="text-stone-500 hover:text-[#C85428] transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-stone-500 hover:text-[#C85428] transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/shipping"
                className="text-stone-500 hover:text-[#C85428] transition-colors"
              >
                Shipping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {!pathname?.startsWith('/products') && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#442D1C] text-[#EDD8B4] shadow-lg flex items-center justify-center z-[60] hover:shadow-2xl hover:bg-[#652810] transition-all border border-[#EDD8B4]/20"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      )}
    </footer>
  );
}
